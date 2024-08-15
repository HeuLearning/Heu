import MiniClassBlock from "../MiniClassBlock";
import Divider from "../Divider";
import { useResponsive } from "../ResponsiveContext";
import HorizontalDatePicker from "./HorizontalDatePicker";
import { usePopUp } from "../PopUpContext";
import MobileClassDetails from "./MobileClassDetails";
import MobileDetailView from "./MobileDetailView";
import { useSessions } from "../SessionsContext";
import { useState, useEffect, useRef } from "react";
import { LessonPlanProvider } from "../LessonPlanContext";

const selectedDay = (val) => {};

// this is equivalent to the web DashboardContainer + CalendarContainer, since the dashboard is simply the calendar
export default function MobileDashboard({
  activeSessionId,
  setActiveSessionId,
  accessToken,
}) {
  const { showPopUp, updatePopUp, hidePopUp } = usePopUp();
  const [isPopUpVisible, setIsPopUpVisible] = useState(false);
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { upcomingSessions } = useSessions();
  const horizontalDatePickerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(0);

  let session;
  if (activeSessionId) {
    session = upcomingSessions.find(
      (session) => session.id === activeSessionId
    );
  }

  const closeClassDetails = () => {
    setActiveSessionId(null);
    hidePopUp("mobile-class-details-popup");
    setIsPopUpVisible(false);
  };

  useEffect(() => {
    if (isPopUpVisible) {
      updatePopUp(
        "mobile-class-details-popup",
        <LessonPlanProvider
          sessionId={activeSessionId}
          accessToken={accessToken}
        >
          <MobileClassDetails
            closeClassDetails={closeClassDetails}
            activeSessionId={activeSessionId}
          />
        </LessonPlanProvider>
      );
    }
  }, [activeSessionId, isPopUpVisible, accessToken]);

  const handleMobileShowClassDetails = (sessionId) => {
    setIsPopUpVisible(true);
    showPopUp({
      id: "mobile-class-details-popup",
      content: (
        <LessonPlanProvider
          sessionId={activeSessionId}
          accessToken={accessToken}
        >
          <MobileClassDetails
            closeClassDetails={closeClassDetails}
            activeSessionId={sessionId}
          />
        </LessonPlanProvider>
      ),
      container: null, // Ensure this ID exists in your DOM
      style: {
        overlay: "overlay-high",
      },
      height: "auto",
    });
  };

  useEffect(() => {
    if (horizontalDatePickerRef.current) {
      setContainerHeight(
        horizontalDatePickerRef.current.getBoundingClientRect().height
      );
    }
  }, []);

  const renderSessions = () => {
    return upcomingSessions.map((session, index, filteredSessions) => {
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
            <Divider spacing={16} />
          )}
          {currentDateKey === previousDateKey ? (
            <MiniClassBlock
              dateCard={
                index === 0 && filteredSessions[0].id === upcomingSessions[0].id
              }
              sessionId={session.id}
              activeSessionId={activeSessionId}
              setActiveSessionId={setActiveSessionId}
              arrow={true}
              handleMobileShowClassDetails={handleMobileShowClassDetails}
            />
          ) : (
            <MiniClassBlock
              dateCard={
                index === 0 && filteredSessions[0].id === upcomingSessions[0].id
              }
              sessionId={session.id}
              activeSessionId={activeSessionId}
              setActiveSessionId={setActiveSessionId}
              handleMobileShowClassDetails={handleMobileShowClassDetails}
            />
          )}
        </div>
      );
    });
  };

  // navbar = 64, containerHeight = horizontaldatepicker, border = 1
  const scrollContainerHeight = window.innerHeight - 64 - containerHeight - 1;

  return (
    <div
      className={`${
        isPopUpVisible ? "overflow-hidden" : ""
      } h-to-bottom w-screen rounded-t-[20px] border-[1px] border-surface_border_tertiary bg-surface_bg_highlight`}
    >
      <div ref={horizontalDatePickerRef}>
        <HorizontalDatePicker
          getSelectedDay={selectedDay}
          labelFormat={"MMMM"}
        />
      </div>
      <div className="bg-surface_bg_tertiary">
        <div className="border-t-[1px] border-t-surface_bg_secondary"></div>
        <div
          className={`sessions no-scrollbar overflow-y-auto px-[16px] pb-[32px] pt-[16px]`}
          style={{ height: scrollContainerHeight }}
        >
          {/* assumes that past sessions have been removed from array */}
          {renderSessions()}
        </div>
      </div>
    </div>
  );
}
