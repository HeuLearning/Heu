import ToggleButton from "./ToggleButton";
import DateCard from "./DateCard";
import MiniClassBlock from "./MiniClassBlock";
import Divider from "./Divider";
import Calendar from "./Calendar";
import { useMemo, useState } from "react";
import { useResponsive } from "./ResponsiveContext";
import styles from "./MiniClassBlock.module.css";
import { useSessions } from "./SessionsContext";
import IconButton from "./IconButton";
import Scrollbar from "./Scrollbar";

export default function CalendarContainer({
  activeSessionId,
  setActiveSessionId,
}) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [visibleMonth, setVisibleMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState("Monthly");
  const { upcomingSessions, allSessions, getSessionStatus } = useSessions();

  const handleToggle = (selectedOption) => {
    setActiveTab(selectedOption);
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

  const visibleMonthName = visibleMonth.toLocaleDateString("default", {
    month: "long",
  });

  const visibleYearName = visibleMonth.toLocaleDateString("default", {
    year: "numeric",
  });

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
      // circle color
      let color;
      if (status === "Canceled" || status === "Attended")
        color = "var(--typeface_tertiary)";
      else if (status === "Confirmed" || status === "Online")
        color = "var(--status_fg_positive)";
      else if (status === "Pending") color = "var(--typeface_primary)";
      if (sessionMap.get(dateKey)) {
        sessionMap.get(dateKey).push(color);
      } else {
        sessionMap.set(dateKey, new Array(color));
      }
    });
    return sessionMap;
  };

  const sessionMap = useMemo(() => createSessionMap(), [allSessions]);

  const renderDailySessions = () => {
    if (
      upcomingSessions.filter(
        (session) =>
          new Date(session.start_time).getMonth() === visibleMonth.getMonth()
      ).length === 0
    )
      return (
        <div className="text-typeface_primary text-body-medium">
          No sessions booked this month.
        </div>
      );
    return upcomingSessions
      .filter(
        (session) =>
          new Date(session.start_time).getMonth() === visibleMonth.getMonth()
      )
      .map((session, index, filteredSessions) => {
        const currentDate = new Date(session.start_time);
        const currentDateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
        const previousDate =
          index > 0 ? new Date(filteredSessions[index - 1].start_time) : null;
        const previousDateKey = previousDate
          ? `${previousDate.getFullYear()}-${previousDate.getMonth()}-${previousDate.getDate()}`
          : null;
        return (
          <div key={session.id}>
            {index > 0 && index < filteredSessions.length && (
              <Divider spacing={12} />
            )}
            {currentDateKey === previousDateKey ? (
              <MiniClassBlock
                dateCard={
                  index === 0 &&
                  filteredSessions[0].id === upcomingSessions[0].id
                }
                sessionId={session.id}
                activeSessionId={activeSessionId}
                setActiveSessionId={setActiveSessionId}
                isDaily={true}
                arrow={true}
              />
            ) : (
              <MiniClassBlock
                dateCard={
                  index === 0 &&
                  filteredSessions[0].id === upcomingSessions[0].id
                }
                sessionId={session.id}
                activeSessionId={activeSessionId}
                setActiveSessionId={setActiveSessionId}
                isDaily={true}
              />
            )}
          </div>
        );
      });
  };

  const renderUpcomingSessions = () => {
    /* assumes that past sessions have been removed from array */
    const next3Sessions = upcomingSessions.slice(
      0,
      Math.min(upcomingSessions.length, 3)
    );
    return next3Sessions.map((session, index) => {
      const currentDate = new Date(session.start_time);
      const currentDateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
      const previousDate =
        index > 0 ? new Date(next3Sessions[index - 1].start_time) : null;
      const previousDateKey = previousDate
        ? `${previousDate.getFullYear()}-${previousDate.getMonth()}-${previousDate.getDate()}`
        : null;
      return index === 0 ? (
        <MiniClassBlock
          dateCard={true}
          sessionId={session.id}
          activeSessionId={activeSessionId}
          setActiveSessionId={setActiveSessionId}
        />
      ) : (
        <div>
          <Divider spacing={12} />
          {currentDateKey === previousDateKey ? (
            <MiniClassBlock
              key={session.id}
              sessionId={session.id}
              activeSessionId={activeSessionId}
              setActiveSessionId={setActiveSessionId}
              arrow={true}
            />
          ) : (
            <MiniClassBlock
              key={session.id}
              sessionId={session.id}
              activeSessionId={activeSessionId}
              setActiveSessionId={setActiveSessionId}
            />
          )}
        </div>
      );
    });
  };

  if (isMobile) {
    return <div></div>;
  } else {
    return (
      <div
        id="calendar-container"
        className="relative flex h-full w-[330px] flex-col rounded-[10px] bg-surface_bg_tertiary pt-[16px] outline-surface_border_tertiary"
      >
        <div className="custom-calendar-header flex justify-between px-[24px] pb-[48px] pt-[8px]">
          <span className="text-typeface_primary leading-tight text-h1">
            {visibleMonthName + " " + visibleYearName}
          </span>
          <div className="flex space-x-[18px]">
            <IconButton
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
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </IconButton>
            <IconButton
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
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </IconButton>
          </div>
        </div>
        <Calendar
          visibleMonth={visibleMonth}
          setVisibleMonth={setVisibleMonth}
          activeTab={activeTab}
          onToggle={handleToggle}
          activeSessionId={activeSessionId}
          setActiveSessionId={setActiveSessionId}
          sessionMap={sessionMap}
        />
        {activeTab === "Monthly" && (
          <div className="px-[16px]">
            <div className="mx-[-16px] border-t-[1px] border-surface_border_tertiary"></div>
            <p className="px-[8px] pb-[28px] pt-[24px] text-typeface_secondary text-body-semibold-cap-height">
              Coming up
            </p>
            <div className="upcoming-events flex flex-col items-center pb-[16px]">
              {renderUpcomingSessions()}
            </div>
          </div>
        )}
        {activeTab === "Daily" && (
          <div className="h-[570px] overflow-y-auto">
            {/* scrollbar halfway into padding, 8px */}
            <Scrollbar
              className="absolute right-[8px] z-50"
              scrollbarHeight={554}
            >
              <div className="daily-events mt-[8px] flex flex-col items-center px-[16px]">
                {/* assumes that past sessions have been removed from array such that the first session is the most upcoming one.
            only dateCard for most upcoming session */}

                <div className="pb-[32px]">{renderDailySessions()}</div>
              </div>
            </Scrollbar>
          </div>
        )}
      </div>
    );
  }
}
