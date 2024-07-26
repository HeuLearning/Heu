import ToggleButton from "./ToggleButton";
import DateCard from "./DateCard";
import MiniClassBlock from "./MiniClassBlock";
import Divider from "./Divider";
import Calendar from "./Calendar";
import { useState } from "react";
import { useResponsive } from "./ResponsiveContext";

export default function CalendarContainer({ upcomingSessions }) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [visibleMonth, setVisibleMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState("Monthly");

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

  if (isMobile) {
    return <div></div>;
  } else {
    return (
      <div
        id="calendar-container"
        className="relative flex h-full w-[330px] flex-col rounded-[10px] bg-surface_bg_tertiary p-[24px] outline-surface_border_secondary"
      >
        <div className="custom-calendar-header flex justify-between pb-[48px]">
          <span className="text-typeface_primary leading-tight text-h1">
            {visibleMonthName + " " + visibleYearName}
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
                  stroke="var(--surface_bg_darkest)"
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
                  stroke="var(--surface_bg_darkest)"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
        <Calendar
          visibleMonth={visibleMonth}
          setVisibleMonth={setVisibleMonth}
          upcomingSessions={upcomingSessions}
          activeTab={activeTab}
          onToggle={handleToggle}
        />
        {activeTab === "Monthly" && (
          <div>
            <div className="mx-[-24px] border-[1px] border-surface_border_tertiary"></div>
            <p className="py-[24px] text-typeface_secondary text-body-semibold">
              Coming up
            </p>
            <div className="upcoming-events">
              {/* assumes that past sessions have been removed from array */}
              {upcomingSessions
                .slice(0, Math.min(upcomingSessions.length, 3))
                .map((session, index) =>
                  index === 0 ? (
                    <MiniClassBlock
                      dateCard={true}
                      date={[session.dayOfTheWeek, session.month, session.day]}
                      startTime={session.startTime}
                      endTime={session.endTime}
                      status={session.status}
                    />
                  ) : (
                    <div>
                      <Divider />
                      <MiniClassBlock
                        key={session.id}
                        date={[
                          session.dayOfTheWeek,
                          session.month,
                          session.day,
                        ]}
                        startTime={session.startTime}
                        endTime={session.endTime}
                        status={session.status}
                      />
                    </div>
                  )
                )}
            </div>
          </div>
        )}
        {activeTab === "Daily" && (
          <div className="daily-events mt-[24px] h-[548px] overflow-auto">
            {/* assumes that past sessions have been removed from array such that the first session is the most upcoming one.
            only dateCard for most upcoming session */}
            {upcomingSessions
              .filter((session) => session.month === visibleMonthName)
              .map((session, index, filteredSessions) => (
                <div>
                  {index > 0 && index < filteredSessions.length && <Divider />}
                  <MiniClassBlock
                    dateCard={
                      index === 0 &&
                      filteredSessions[0].id === upcomingSessions[0].id
                    }
                    date={[session.dayOfTheWeek, session.month, session.day]}
                    startTime={session.startTime}
                    endTime={session.endTime}
                    status={session.status}
                  />
                </div>
              ))}
          </div>
        )}
      </div>
    );
  }
}
