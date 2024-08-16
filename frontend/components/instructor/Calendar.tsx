import ReactCalendar from "react-calendar";
import { useState, useEffect, useRef } from "react";
import styles from "./Calendar.module.css";
import ToggleButton from "./ToggleButton";
import { useMemo } from "react";
import { useSessions } from "./SessionsContext";
import { isSameDay } from "date-fns";
import Dot from "./Dot";
import MenuItem from "./MenuItem";
import { format } from "date-fns";
import Divider from "./Divider";

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
  const [popUpPosition, setPopUpPosition] = useState({ bottom: 0, left: 0 });

  const displaySessions = (date, calendarElement = null) => {
    const sessions = allSessions.filter((session) =>
      isSameDay(new Date(session.start_time), date)
    );
    const upcoming = upcomingSessions.filter((session) =>
      isSameDay(new Date(session.start_time), date)
    );
    if (sessions.length === 0) {
      setActiveSessionId(null);
    } else if (
      sessions.length > 1 &&
      calendarElement === null &&
      upcoming.length !== 0
    ) {
      setSelectedDate(date);
      setActiveSessionId(upcoming[0].id);
    } else if (sessions.length > 1) {
      showMultipleSessionPopUp(sessions, date, calendarElement);
      setSelectedDate(date);
      setActiveSessionId(null);
    } else {
      setSelectedDate(date);
      setActiveSessionId(sessions[0].id);
    }
  };

  const showMultipleSessionPopUp = (
    multipleSessions,
    date,
    calendarElement
  ) => {
    setMultipleDates(multipleSessions);
    if (calendarElement) {
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const tileElement = calendarElement.querySelector(
        `[data-date="${dateKey}"]`
      );
      if (tileElement) {
        const tileRect = tileElement.getBoundingClientRect();
        const calendarRect = calendarElement.getBoundingClientRect();

        setPopUpPosition({
          bottom: calendarRect.bottom - tileRect.top + 39, // Position above the tile
          left: tileRect.left - calendarRect.left + tileRect.width / 2, // Centered
        });
      }
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
      <div
        className="relative flex items-center justify-center"
        data-date={dateKey}
      >
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

  const dropdownRef = useRef(null);
  const calendarContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMultipleDates([]);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

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
          <div className="relative" ref={calendarContainerRef}>
            <div
              className="absolute z-10"
              ref={dropdownRef}
              style={{
                bottom: `${popUpPosition.bottom}px`,
                left: `${popUpPosition.left}px`,
                transform: "translateX(-50%)", // This centers the popup horizontally
              }}
            >
              {multipleDates.length !== 0 && (
                <div className="rounded-[10px] bg-surface_bg_highlight p-[4px] shadow-150">
                  {multipleDates.map((session, index) => (
                    <>
                      {index > 0 && (
                        <div className="px-[6px]">
                          <Divider spacing={4} />
                        </div>
                      )}
                      <MenuItem
                        onClick={() => {
                          setActiveSessionId(session.id);
                          setMultipleDates([]);
                        }}
                      >
                        <div className="-ml-[4px] flex items-center">
                          <Dot status={getSessionStatus(session)} />
                          <div
                            className={
                              getSessionStatus(session) === "Canceled"
                                ? "text-typeface_tertiary"
                                : ""
                            }
                          >
                            {format(session.start_time, "h:mma") +
                              " - " +
                              format(session.end_time, "h:mma")}
                          </div>
                        </div>
                      </MenuItem>
                    </>
                  ))}
                </div>
              )}
            </div>
            <div
              className={`-mt-[2px] flex flex-col items-center px-[1px] pb-[22px] ${styles["react-calendar"]}`}
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
                    const color = sessionMap.get(dateKey);
                    if (color) {
                      for (let i = 0; i < color.length; i++) {
                        if (
                          color[i] === "var(--status_fg_positive)" ||
                          color[i] === "var(--typeface_primary)"
                        ) {
                          classes.push(styles["calendar-day-special"]);
                          break;
                        }
                      }
                    }
                    return classes.join(" ");
                  }
                }}
                tileContent={tileContent}
                onClickDay={(clickedDay) => {
                  setSelectedDate(clickedDay);
                  displaySessions(clickedDay, calendarContainerRef.current);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
