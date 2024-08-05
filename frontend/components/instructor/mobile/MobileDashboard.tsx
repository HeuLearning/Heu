import MiniClassBlock from "../MiniClassBlock";
import Divider from "../Divider";
import { useResponsive } from "../ResponsiveContext";
import HorizontalDatePicker from "./HorizontalDatePicker";
import { usePopUp } from "../PopUpContext";
import MobileClassDetails from "./MobileClassDetails";
import MobileDetailView from "./MobileDetailView";
import { useSessions } from "../SessionsContext";
import { useState, useEffect, useRef } from "react";

const selectedDay = (val) => {};

// this is equivalent to the web DashboardContainer + CalendarContainer, since the dashboard is simply the calendar
export default function MobileDashboard({
  activeSessionId,
  setActiveSessionId,
  activeSessionByDate,
  setActiveSessionByDate,
}) {
  const { showPopUp, hidePopUp } = usePopUp();
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

  const handleMobileShowClassDetails = (sessionId) => {
    setIsPopUpVisible(true);
    showPopUp({
      id: "mobile-class-details-popup",
      content: (
        <MobileClassDetails
          closeClassDetails={closeClassDetails}
          activeSessionId={sessionId}
          activeSessionByDate={activeSessionByDate}
        />
      ),
      container: null, // Ensure this ID exists in your DOM
      style: {
        overlay: "bg-surface_bg_darkest bg-opacity-[0.5]",
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

  // navbar = 64, containerHeight = horizontaldatepicker, border = 1, border padding = 8, bottom padding = 24
  const scrollContainerHeight =
    window.innerHeight - 64 - containerHeight - 1 - 8 - 24;

  return (
    <div
      className={`${
        isPopUpVisible ? "overflow-hidden" : ""
      } h-to-bottom w-screen rounded-t-[20px] border-[1px] border-t-surface_border_tertiary bg-surface_bg_highlight`}
    >
      <div ref={horizontalDatePickerRef}>
        <HorizontalDatePicker
          getSelectedDay={selectedDay}
          labelFormat={"MMMM"}
        />
      </div>
      <div>
        <div className="border-[1px] border-surface_bg_secondary"></div>
        <div
          className={`sessions overflow-y-auto px-[24px] pt-[8px] no-scrollbar`}
          style={{ height: scrollContainerHeight }}
        >
          {/* assumes that past sessions have been removed from array */}
          {upcomingSessions.map((session, index) =>
            index === 0 ? (
              <MiniClassBlock
                dateCard={true}
                sessionId={session.id}
                activeSessionId={activeSessionId}
                setActiveSessionId={setActiveSessionId}
                setActiveSessionByDate={setActiveSessionByDate}
                handleMobileShowClassDetails={handleMobileShowClassDetails}
              />
            ) : (
              <div>
                <Divider />
                <MiniClassBlock
                  key={session.id}
                  sessionId={session.id}
                  activeSessionId={activeSessionId}
                  setActiveSessionId={setActiveSessionId}
                  setActiveSessionByDate={setActiveSessionByDate}
                  handleMobileShowClassDetails={handleMobileShowClassDetails}
                />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
