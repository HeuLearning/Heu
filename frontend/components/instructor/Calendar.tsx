import ReactCalendar from "react-calendar";
import { useState, useEffect } from "react";
import styles from "./Calendar.module.css";
import ToggleButton from "./ToggleButton";
import { useMemo } from "react";
import { useSessions } from "./SessionsContext";
import { isSameDay } from "date-fns";

export default function Calendar({
  visibleMonth,
  setVisibleMonth,
  activeTab,
  onToggle,
  activeSessionByDate,
  setActiveSessionByDate,
  activeSessionId,
  setActiveSessionId,
}) {
  const { getSessionStatus, allSessions, upcomingSessions } = useSessions();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const createSessionMap = () => {
    const sessionMap = new Map();
    allSessions.forEach((session) => {
      const startDate = new Date(session.start_time);
      const year = startDate.getFullYear();
      const month = startDate.getMonth();
      const day = startDate.getDate();
      // key in the map based on the session day online, not time
      const dateKey = `${year}-${month}-${day}`;
      const status = getSessionStatus(session);
      sessionMap.set(dateKey, status);
    });
    return sessionMap;
  };

  const sessionMap = useMemo(() => createSessionMap(), [upcomingSessions]);

  const displaySessions = (date) => {
    const sessions = upcomingSessions.filter((session) =>
      isSameDay(new Date(session.start_time), date)
    );
    if (sessions.length === 0) {
      setActiveSessionByDate(null);
      setActiveSessionId(null);
    } else if (sessions.length > 1) {
      setSelectedDate(date);
      setActiveSessionByDate(date);
      setActiveSessionId(null);
    } else {
      setSelectedDate(date);
      setActiveSessionId(sessions[0].id);
      setActiveSessionByDate(null);
    }
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

    let isSelected;

    isSelected =
      selectedDate &&
      date.toDateString() === new Date(selectedDate).toDateString();
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
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

  useEffect(() => {
    const today = new Date();
    displaySessions(today);
  }, [upcomingSessions]);

  useEffect(() => {
    if (activeSessionByDate) {
      setSelectedDate(new Date(activeSessionByDate));
    } else if (activeSessionId) {
      const session = allSessions.find(
        (session) => session.id === activeSessionId
      );
      if (session) {
        setSelectedDate(new Date(session.start_time));
      }
    }
  }, [activeSessionByDate, activeSessionId, allSessions]);

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="w-full pb-[22px]">
          <ToggleButton
            buttonOptions={["Monthly", "Daily"]}
            selected={activeTab}
            onToggle={onToggle}
          />
        </div>
        {activeTab === "Monthly" ? (
          <div className={`-mt-[2px] pb-[24px] ${styles["react-calendar"]}`}>
            <ReactCalendar
              defaultValue={new Date()}
              value={selectedDate}
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
              tileClassName={({ date, view }) => {
                if (view === "month") {
                  const classes = [];
                  if (isBeforeToday(date)) {
                    classes.push(styles["disabled-date"]);
                  }
                  const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
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
              onClickDay={(clickedDay) => {
                setSelectedDate(clickedDay);
                displaySessions(clickedDay);
              }}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
