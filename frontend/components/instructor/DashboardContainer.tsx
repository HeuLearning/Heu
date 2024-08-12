import CalendarContainer from "./CalendarContainer";
import SessionDetailViewContainer from "./SessionDetailViewContainer";
import { useResponsive } from "./ResponsiveContext";
import MobileDetailView from "components/instructor/mobile/MobileDetailView";
import MobileDashboard from "components/instructor/mobile/MobileDashboard";
import { useEffect, useState } from "react";
import { useSessions } from "./SessionsContext";
import { LessonPlanProvider } from "./LessonPlanContext";

export default function DashboardContainer({ accessToken }) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeSessionByDate, setActiveSessionByDate] = useState(null);

  // website navbar = 64, bottom margin = 15
  const dashboardHeight = window.innerHeight - 64 - 15;

  const renderSessionDetailViewContainer = () => (
    <div className="flex-grow">
      <LessonPlanProvider sessionId={activeSessionId} accessToken={accessToken}>
        <SessionDetailViewContainer
          activeSessionByDate={activeSessionByDate}
          activeSessionId={activeSessionId}
        />
      </LessonPlanProvider>
    </div>
  );

  if (isMobile) {
    return (
      <div className="relative">
        <MobileDashboard
          activeSessionId={activeSessionId}
          setActiveSessionId={setActiveSessionId}
          activeSessionByDate={activeSessionByDate}
          setActiveSessionByDate={setActiveSessionByDate}
        />
      </div>
    );
  } else {
    return (
      <div
        id="dashboard-container"
        className="relative mb-4 ml-4 mr-4 flex rounded-[20px] bg-surface_bg_highlight p-[10px]"
        style={{ minHeight: dashboardHeight }}
      >
        <div className="flex-shrink-0">
          <CalendarContainer
            activeSessionByDate={activeSessionByDate}
            setActiveSessionByDate={setActiveSessionByDate}
            activeSessionId={activeSessionId}
            setActiveSessionId={setActiveSessionId}
          />
        </div>
        {renderSessionDetailViewContainer()}
      </div>
    );
  }
}
