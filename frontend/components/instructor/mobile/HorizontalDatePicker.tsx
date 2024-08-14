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

export default function HorizontalDatePicker({
  endDate = null,
  selectDate = null,
  getSelectedDay,
  labelFormat = "",
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [isScrolling, setIsScrolling] = useState(false);

  const scrollContainerRef = useRef(null);

  const today = new Date();
  const startDate = subDays(today, 120);
  const lastDate = addDays(today, endDate || 120);
  const selectedStyle = {
    fontWeight: "semibold",
    width: "44px",
    height: "44px",
    borderRadius: "100%",
    backgroundColor: "var(--surface_bg_darkest)",
    color: "var(--typeface_highlight) !important",
  };

  const getStyles = (day) => {
    if (isSameDay(day, selectedDate)) {
      return selectedStyle;
    }
    return null;
  };

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

    const dateString = date.toISOString().split("T")[0];
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
      setTimeout(() => setIsScrolling(false), 1000);
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
        days.push(
          <div className="ml-[8px]" key={format(day, "yyyy-MM-dd")}>
            <div className={styles.dayLabel}>
              {format(day, dayFormat).charAt(0)}
            </div>
            <div
              id={`${getId(day)}`}
              className={`${styles.dateDayItem} ${
                isSameDay(day, selectedDate) ? styles.selectedDate : ""
              } ${
                isBeforeToday(day) ? styles.pastDateLabel : styles.dateLabel
              }`}
              onClick={() => onDateClick(day)}
              data-date={day.toISOString()}
            >
              {format(day, dateFormat)}
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
    setSelectedDate(day);
    if (getSelectedDay) {
      getSelectedDay(day);
    }
  };

  useEffect(() => {
    if (getSelectedDay) {
      if (selectDate) {
        getSelectedDay(selectDate);
      } else {
        getSelectedDay(startDate);
      }
    }
  }, []);

  useEffect(() => {
    if (selectDate) {
      if (!isSameDay(selectedDate, selectDate)) {
        setSelectedDate(selectDate);
        setTimeout(() => {
          let view = document.getElementById("selected");
          if (view) {
            view.scrollIntoView({
              behavior: "smooth",
              inline: "center",
              block: "nearest",
            });
          }
        }, 20);
      }
    }
  }, [selectDate]);

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
        <button className="custom-navigation-button" onClick={prevMonth}>
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="0.5"
              y="0.5"
              width="39"
              height="39"
              rx="19.5"
              fill="white"
            />
            <rect
              x="0.5"
              y="0.5"
              width="39"
              height="39"
              rx="19.5"
              stroke="var(--action_border_secondary)"
            />
            <path
              d="M21.5 16.25L18 19.75L21.5 23.25"
              stroke="var(--action_bg_primary)"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <span className="text-typeface_primary leading-tight text-h3">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <div className="flex space-x-[12px]">
          <button className="custom-navigation-button" onClick={nextMonth}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="0.5"
                y="0.5"
                width="39"
                height="39"
                rx="19.5"
                fill="white"
              />
              <rect
                x="0.5"
                y="0.5"
                width="39"
                height="39"
                rx="19.5"
                stroke="var(--action_border_secondary)"
              />
              <path
                d="M18.5 23.25L22 19.75L18.5 16.25"
                stroke="var(--action_bg_primary)"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
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
