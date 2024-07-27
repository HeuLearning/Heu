import ReactCalendar from "react-calendar";
import { useState } from "react";
import styles from "./Calendar.module.css";
import ToggleButton from "./ToggleButton";
import { useMemo } from "react";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function Calendar({
  visibleMonth,
  setVisibleMonth,
  upcomingSessions,
  activeTab,
  onToggle,
}) {
  const [value, setValue] = useState(new Date());

  const createSessionMap = () => {
    const sessionMap = new Map();
    upcomingSessions.forEach((session) => {
      const dateKey = `${session.year}-${session.month}-${session.day}`;
      sessionMap.set(dateKey, session.status);
    });
    return sessionMap;
  };

  const sessionMap = useMemo(() => createSessionMap(), [upcomingSessions]);

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

  const tileContent = ({ date, view }) => {
    let color = "";
    if (view !== "month") return null;

    const isSelected = date.toDateString() === value.toDateString();
    const dateKey = `${date.getFullYear()}-${
      months[date.getMonth()]
    }-${date.getDate()}`;
    const status = sessionMap.get(dateKey);

    // circle color
    if (status === "Canceled")
      color = isSelected ? "white" : "var(--typeface_tertiary)";
    else if (status === "Confirmed" || status === "Online")
      color = isSelected ? "white" : "var(--status_fg_positive)";
    else if (status === "Pending")
      color = isSelected ? "white" : "var(--typeface_primary)";
    if (color === "") return null;

    if (isBeforeToday(date) && !isSelected) {
      color = "var(--typeface_tertiary)"; // Grey for past dates
    }

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
      <div className="flex flex-col items-center">
        <ToggleButton
          buttonOptions={["Monthly", "Daily"]}
          selected={activeTab}
          onToggle={onToggle}
        />
        {activeTab === "Monthly" ? (
          <div className={`py-[24px] ${styles["react-calendar"]}`}>
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
              tileDisabled={({ date, view }) => isBeforeToday(date)}
              tileClassName={({ date, view }) => {
                if (view === "month") {
                  const classes = [];
                  if (isBeforeToday(date)) {
                    classes.push(styles["disabled-date"]);
                  }
                  const dateKey = `${date.getFullYear()}-${
                    months[date.getMonth()]
                  }-${date.getDate()}`;
                  const status = sessionMap.get(dateKey);
                  if (
                    !isBeforeToday(date) &&
                    (status === "Pending" ||
                      status === "Confirmed" ||
                      status === "Online")
                  ) {
                    classes.push("calendar-day-special");
                  }
                  return classes.join(" ");
                }
              }}
              tileContent={tileContent}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
