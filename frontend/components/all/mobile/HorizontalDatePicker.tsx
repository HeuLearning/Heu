/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from "react";
import styles from "./HorizontalDatePicker.module.css";
import {
  subDays,
  addDays,
  addMonths,
  differenceInMonths,
  format,
  isSameDay,
  isSameMonth,
  lastDayOfMonth,
  startOfMonth,
} from "date-fns";
import BackButton from "../buttons/BackButton";
import { useSessions } from "../data-retrieval/SessionsContext";

export default function HorizontalDatePicker({
  endDate = null,
  sessionMap,
  selectedDate,
  setSelectedDate,
}) {
  const today = new Date();
  const startDate = subDays(today, 120);
  const lastDate = addDays(today, endDate || 120);

  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const { upcomingSessions } = useSessions();
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollContainerRef = useRef(null);

  const getId = (day) => {
    if (isSameDay(day, selectedDate)) {
      return "selected";
    } else {
      return "";
    }
  };

  const isBeforeToday = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight to ignore the time
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  const calculateScrollPositionForDate = (date) => {
    const container = scrollContainerRef.current;
    if (!container) {
      return 0;
    }

    const dateString = date.toLocaleDateString();
    const dateElement = container.querySelector(`[data-date^="${dateString}"]`);

    if (!dateElement) {
      return 0;
    }

    // Get all date elements
    const allDateElements = container.querySelectorAll("[data-date]");

    // Convert to array and find the index of today's date
    const dateIndex = Array.from(allDateElements).indexOf(dateElement);

    // Calculate the width of a single date element
    const dateWidth = dateElement.offsetWidth + 8; // margin left of each element
    // Calculate the scroll position
    const scrollPosition =
      dateIndex * dateWidth - container.offsetWidth / 2 + dateWidth / 2 + 4; // half of the margin left
    return Math.max(0, scrollPosition);
  };

  const scrollToDate = (date, behavior = "auto") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollPosition = calculateScrollPositionForDate(date);
      setIsScrolling(true);
      container.scrollTo({
        left: scrollPosition,
        behavior: behavior,
      });
      setTimeout(() => setIsScrolling(false), 500);
    }
  };

  // Scroll to today's date on initial render
  useEffect(() => {
    scrollToDate(today);
  }, []);

  // to update the month name when scrolling
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      const handleScroll = () => {
        if (isScrolling) return;

        const containerRect = scrollContainer.getBoundingClientRect();
        const middleX = containerRect.left + containerRect.width / 2;
        const middleY = containerRect.top + containerRect.height / 2;

        const visibleDayElement = document.elementFromPoint(middleX, middleY);

        if (visibleDayElement && visibleDayElement.hasAttribute("data-date")) {
          const day = new Date(visibleDayElement.getAttribute("data-date"));
          const monthStart = startOfMonth(day);

          if (!isSameMonth(monthStart, currentMonth)) {
            setCurrentMonth(monthStart);
          }
        }
      };

      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, [currentMonth, isScrolling]);

  function renderDays() {
    const dayFormat = "E";
    const dateFormat = "d";
    const months = [];
    let days = [];
    for (let i = 0; i <= differenceInMonths(lastDate, startDate); i++) {
      let start, end;
      const month = startOfMonth(addMonths(startDate, i));
      start = i === 0 ? Number(format(startDate, dateFormat)) - 1 : 0;
      end =
        i === differenceInMonths(lastDate, startDate)
          ? Number(format(lastDate, "d"))
          : Number(format(lastDayOfMonth(month), "d"));
      for (let j = start; j < end; j++) {
        const day = addDays(month, j);
        const dateKey = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
        days.push(
          <div className="ml-[8px]" key={format(day, "yyyy-MM-dd")}>
            <div className={styles.dayLabel}>
              {format(day, dayFormat).charAt(0)}
            </div>
            <div
              id={`${getId(day)}`}
              className={`relative ${styles.dateDayItem} ${
                isSameDay(day, selectedDate) ? styles.selectedDate : ""
              } ${
                !isSameDay(today, selectedDate) && isSameDay(day, today)
                  ? styles.today
                  : ""
              } ${
                isBeforeToday(day)
                  ? styles.pastDateLabel
                  : upcomingSessions.filter((session) =>
                      isSameDay(new Date(session.start_time), day)
                    ).length > 0
                  ? styles.dateLabelActive
                  : styles.dateLabelInactive
              }`}
              onClick={
                upcomingSessions.filter((session) =>
                  isSameDay(new Date(session.start_time), day)
                ).length > 0
                  ? () => onDateClick(day)
                  : null
              }
              data-date={day.toLocaleDateString()}
            >
              {format(day, dateFormat)}
              {sessionMap.get(dateKey) && (
                <div className="z-5 absolute bottom-[6px] flex items-center gap-[2px]">
                  {Array.isArray(sessionMap.get(dateKey)) &&
                    sessionMap.get(dateKey).map((dotColor, index) => (
                      <svg
                        key={index}
                        width="4"
                        height="4"
                        viewBox="0 0 4 4"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="2" cy="2" r="2" fill={dotColor} />
                      </svg>
                    ))}
                </div>
              )}
            </div>
          </div>
        );
      }
      months.push(
        <div
          key={format(month, "yyyy-MM")}
          data-month={format(month, "yyyy-MM")}
        >
          <div className={styles.daysContainer}>{days}</div>
        </div>
      );
      days = [];
    }
    return <div className="flex">{months}</div>;
  }

  const onDateClick = (day) => {
    if (isSameDay(day, selectedDate)) {
      setSelectedDate(null);
    } else {
      setSelectedDate(day);
    }
  };

  const nextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1);
    scrollToMonth(nextMonth);
    setCurrentMonth(nextMonth);
  };

  const prevMonth = () => {
    const prevMonth = addMonths(currentMonth, -1);
    scrollToMonth(prevMonth);
    setCurrentMonth(prevMonth);
  };

  const scrollToMonth = (date) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setIsScrolling(true);

    const monthElement = container.querySelector(
      `[data-month="${format(date, "yyyy-MM")}"]`
    );
    if (monthElement) {
      const containerRect = container.getBoundingClientRect();
      const monthRect = monthElement.getBoundingClientRect();
      const scrollLeft =
        monthRect.left - containerRect.left + container.scrollLeft;

      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });

      // Reset the flag after scrolling is complete
      setTimeout(() => {
        setIsScrolling(false);
      }, 5000); // Adjust this timeout if needed
    } else {
      setIsScrolling(false);
    }
  };

  return (
    <div className="flex w-full flex-col">
      <div className="custom-calendar-header sticky flex items-center justify-between px-[16px] pb-[24px] pt-[16px]">
        <BackButton
          variation="button-secondary"
          className="custom-navigation-button button-secondary"
          onClick={prevMonth}
        />
        <span className="text-typeface_primary leading-tight text-h3">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <BackButton
          variation="button-secondary"
          direction="forward"
          className="custom-navigation-button"
          onClick={nextMonth}
        />
      </div>
      <div
        id={"container"}
        className={`pb-[8px] ${styles.dateListScrollable}`}
        ref={scrollContainerRef}
      >
        {renderDays()}
      </div>
    </div>
  );
}
