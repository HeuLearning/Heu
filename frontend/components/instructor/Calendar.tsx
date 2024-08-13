import ReactCalendar from "react-calendar";
import { useState, useEffect } from "react";
import styles from "./Calendar.module.css";
import ToggleButton from "./ToggleButton";
import { useMemo } from "react";
import { useSessions } from "./SessionsContext";
import { isSameDay } from "date-fns";
import Dot from "./Dot";
import MenuItem from "./MenuItem";
import { format } from "date-fns";

export default function Calendar({
  visibleMonth,
  setVisibleMonth,
  activeTab,
  onToggle,
  activeSessionId,
  setActiveSessionId,
  sessionMap,
}) {
  const { getSessionStatus, allSessions, upcomingSessions } = useSessions();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [multipleDates, setMultipleDates] = useState([]);

  const displaySessions = (date) => {
    const sessions = upcomingSessions.filter((session) =>
      isSameDay(new Date(session.start_time), date)
    );
    if (sessions.length === 0) {
      setActiveSessionId(null);
    } else if (sessions.length > 1) {
      setSelectedDate(date);
      showMultipleSessionPopUp(sessions);
      setActiveSessionId(null);
    } else {
      setSelectedDate(date);
      setActiveSessionId(sessions[0].id);
    }
  };

  const showMultipleSessionPopUp = (multipleSessions) => {
    setMultipleDates(multipleSessions);
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
    if (view !== "month") return null;

    let isSelected;

    isSelected =
      selectedDate &&
      date.toDateString() === new Date(selectedDate).toDateString();
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    let color = sessionMap?.get(dateKey) || [];

    if (sessionMap) {
      if (isBeforeToday(date) && !isSelected) {
        color = color.map(() => "var(--typeface_tertiary)"); // Grey for past dates
      } else if (isSelected) {
        color = color.map(() => "white");
      }
    }
    return (
      <div className="relative flex items-center justify-center">
        <div className="absolute bottom-[2px] flex items-center gap-[2px]">
          {Array.isArray(color) &&
            color.map((dotColor, index) => (
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
    if (activeSessionId) {
      const session = allSessions.find(
        (session) => session.id === activeSessionId
      );
      if (session) {
        setSelectedDate(new Date(session.start_time));
      }
    }
  }, [activeSessionId, allSessions]);

  return (
    <>
      <div className="flex flex-col items-center">
        <div
          className={`w-full ${
            activeTab === "Monthly" ? "pb-[22px]" : "pb-[20px]"
          }`}
        >
          <ToggleButton
            buttonOptions={["Monthly", "Daily"]}
            selected={activeTab}
            onToggle={onToggle}
          />
        </div>
        {activeTab === "Monthly" && (
          <div>
            {multipleDates &&
              multipleDates.map((session) => (
                <MenuItem onClick={() => setActiveSessionId(session.id)}>
                  {format(session.start_time, "h:mma") +
                    " - " +
                    format(session.end_time, "h:mma")}
                </MenuItem>
              ))}
            <div
              className={`-mt-[2px] flex flex-col items-center px-[1px] pb-[24px] ${styles["react-calendar"]}`}
            >
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
                    const classes = [styles["calendar-tile"]]; // Add this line
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
          </div>
        )}
      </div>
    </>
  );
}
