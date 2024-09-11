import MiniClassBlock from "./MiniClassBlock";
import Divider from "./Divider";
import Calendar from "./Calendar";
import { useEffect, useMemo, useRef, useState } from "react";
import { useResponsive } from "./ResponsiveContext";
import { useSessions } from "./data-retrieval/SessionsContext";
import IconButton from "./buttons/IconButton";
import Scrollbar from "./Scrollbar";
import styles from "./popups/SidePopUp.module.css";
import { useUserRole } from "./data-retrieval/UserRoleContext";

interface CalendarContainerProps {
  activeSessionId: number | null;
  setActiveSessionId: (id: number | null) => void;
}

export default function CalendarContainer({
  activeSessionId,
  setActiveSessionId,
}: CalendarContainerProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { userRole } = useUserRole();
  const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("Monthly");
  const { upcomingSessions, allSessions, getSessionStatus } = useSessions();

  const [isScrolled, setIsScrolled] = useState(false);

  const scrollableRef = useRef<HTMLDivElement>(null);

  const handleToggle = (selectedOption: string) => {
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
      if (userRole === "in") {
        if (status === "Canceled" || status === "Attended")
          color = "var(--typeface_tertiary)";
        else if (status === "Confirmed" || status === "Online")
          color = "var(--status_fg_positive)";
        else if (status === "Pending") color = "var(--typeface_primary)";
        if (sessionMap.get(dateKey)) {
          sessionMap.get(dateKey).push(color);
        } else if (color !== undefined) {
          sessionMap.set(dateKey, new Array(color));
        }
      } else if (userRole === "st") {
        if (status === "Enrolled") {
          color = "var(--typeface_primary)";
        } else if (status === "Confirmed") {
          color = "var(--status_fg_positive)";
        } else if (status === "Waitlisted") {
          color = "var(--typeface_primary)";
        } else if (status === "Attended") {
          color = "var(--typeface_tertiary)";
        }
        if (sessionMap.get(dateKey)) {
          sessionMap.get(dateKey).push(color);
        } else if (color !== undefined) {
          sessionMap.set(dateKey, new Array(color));
        }
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
    ) {
      return (
        <div className="text-typeface_primary text-body-medium">
          No sessions booked this month.
        </div>
      );
    } else {
      let firstActiveSession = upcomingSessions.find(
        (session) =>
          getSessionStatus(session) === "Online" ||
          getSessionStatus(session) === "Confirmed"
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
                    session === firstActiveSession &&
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
                    session === firstActiveSession &&
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
    }
  };

  const renderUpcomingSessions = () => {
    /* assumes that past sessions have been removed from array */
    if (upcomingSessions.length === 0) {
      return (
        <div className="text-typeface_secondary text-body-medium">
          No upcoming sessions.
        </div>
      );
    } else {
      let firstActiveSession = upcomingSessions.find(
        (session) =>
          getSessionStatus(session) === "Online" ||
          getSessionStatus(session) === "Confirmed"
      );
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
            dateCard={firstActiveSession === session}
            sessionId={session.id}
            activeSessionId={activeSessionId}
            setActiveSessionId={setActiveSessionId}
          />
        ) : (
          <div>
            <Divider spacing={12} />
            {currentDateKey === previousDateKey ? (
              <MiniClassBlock
                dateCard={firstActiveSession === session}
                key={session.id}
                sessionId={session.id}
                activeSessionId={activeSessionId}
                setActiveSessionId={setActiveSessionId}
                arrow={true}
              />
            ) : (
              <MiniClassBlock
                dateCard={firstActiveSession === session}
                key={session.id}
                sessionId={session.id}
                activeSessionId={activeSessionId}
                setActiveSessionId={setActiveSessionId}
              />
            )}
          </div>
        );
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (scrollableRef.current) {
        const scrollY = scrollableRef.current.scrollTop; // Use scrollTop for the scrollable container
        if (scrollY > 25) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }
      }
    };

    handleScroll(); // Initial check
    if (scrollableRef.current) {
      const currentScrollable = scrollableRef.current;
      currentScrollable.addEventListener("scroll", handleScroll);
      // Clean up the event listener on component unmount
      return () => {
        currentScrollable.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

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
          <div>
            <div
              className={`${isScrolled ? styles.stickyHeaderWithBorder : ""}`}
            ></div>
            <div className={`h-[570px] overflow-y-auto`}>
              {/* scrollbar halfway into padding, 8px */}
              <Scrollbar
                className="absolute right-[8px] z-50"
                scrollbarHeight={554}
                contentRef={scrollableRef}
              >
                <div
                  className={`daily-events mt-[8px] flex flex-col items-center px-[16px]`}
                >
                  {/* assumes that past sessions have been removed from array such that the first session is the most upcoming one.
            only dateCard for most upcoming session */}

                  <div className="pb-[32px]">{renderDailySessions()}</div>
                </div>
              </Scrollbar>
            </div>
          </div>
        )}
      </div>
    );
  }
}
