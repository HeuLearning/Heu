import ReactCalendar from "react-calendar";
import { useState } from "react";
import styles from "./Calendar.module.css";
import ToggleButton from "./ToggleButton";

export default function Calendar() {
  const [value, setValue] = useState(new Date());
  const [visibleMonth, setVisibleMonth] = useState(new Date());

  const handleChange = (newValue, event) => {
    setValue(newValue);
  };

  const navigationLabel = ({ date, label }) => {
    return `${date.toLocaleString("default", {
      month: "short",
    })} ${date.getFullYear()}`;
  };

  const formatShortWeekday = (locale, date) => {
    const day = date
      .toLocaleDateString(locale, { weekday: "short" })
      .slice(0, 1); // Get first letter
    return day;
  };

  const handlePrevMonth = () => {
    setVisibleMonth(
      (prevMonth) =>
        new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setVisibleMonth(
      (prevMonth) =>
        new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1)
    );
  };

  const hasGreyCircle = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    const day = date.getDate(); // 1-31
    const circleDates = {
      2024: {
        6: [11, 18, 23],
        7: [1, 15, 31],
      },
    };
    return (
      circleDates[year] &&
      circleDates[year][month] &&
      circleDates[year][month].includes(day)
    );
  };

  const hasGreenCircle = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    const day = date.getDate(); // 1-31
    const circleDates = {
      2024: {
        6: [20, 29],
        7: [2, 5, 13],
      },
    };
    return (
      circleDates[year] &&
      circleDates[year][month] &&
      circleDates[year][month].includes(day)
    );
  };

  const hasBlackCircle = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    const day = date.getDate(); // 1-31
    const circleDates = {
      2024: {
        6: [27],
        8: [3],
      },
    };
    return (
      circleDates[year] &&
      circleDates[year][month] &&
      circleDates[year][month].includes(day)
    );
  };

  const tileContent = ({ date, view }) => {
    let color = "";
    if (view !== "month") return null;

    if (hasGreyCircle(date)) color = "var(--typeface_tertiary)";
    else if (hasGreenCircle(date)) color = "var(--status_fg_positive)";
    else if (hasBlackCircle(date)) color = "var(--typeface_primary)";
    if (color === "") return null;
    else {
      return (
        <div className="relative flex items-center justify-center">
          <div className="absolute bottom-[0.1px]">
            <svg
              width="6"
              height="6"
              viewBox="0 0 6 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="3" cy="3" r="3" fill={color} />
            </svg>
          </div>
        </div>
      );
    }
  };

  const isBeforeToday = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight to ignore the time
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  return (
    <>
      <div className="custom-calendar-header flex justify-between pb-[24px]">
        <span className="text-typeface_primary leading-tight text-h1">
          {visibleMonth.toLocaleDateString("default", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <div className="flex space-x-[20px]">
          <button
            className="custom-navigation-button"
            onClick={handlePrevMonth}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.75 4.75L6.25 8.25L9.75 11.75"
                stroke="var(--surface_bg_dark)"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
          <button
            className="custom-navigation-button"
            onClick={handleNextMonth}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.25 11.25L9.75 7.75L6.25 4.25"
                stroke="var(--surface_bg_dark)"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex flex-col items-center gap-[24px]">
        <ToggleButton buttonOptions={["Monthly", "Daily"]} selected="Monthly" />
        <div className={styles["react-calendar"]}>
          <ReactCalendar
            onChange={handleChange}
            value={value}
            calendarType={"gregory"}
            activeStartDate={visibleMonth}
            onActiveStartDateChange={({ activeStartDate }) =>
              setVisibleMonth(activeStartDate)
            }
            navigationLabel={navigationLabel}
            minDetail="month"
            maxDetail="month"
            next2Label={null}
            prev2Label={null}
            showNavigation={false}
            formatShortWeekday={formatShortWeekday} // changes Mon -> M etc.
            showNeighboringMonth={false}
            tileDisabled={({ date }) => isBeforeToday(date)}
            tileClassName={({ date }) =>
              isBeforeToday(date) ? styles["disabled-date"] : ""
            }
            tileContent={tileContent}
          />
        </div>
      </div>
    </>
  );
}
