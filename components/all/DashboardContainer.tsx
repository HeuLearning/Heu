"use client";

import React, { useState, useEffect } from 'react';
import CalendarContainer from "./CalendarContainer";
import SessionDetailViewContainer from "./SessionDetailViewContainer";
import { useResponsive } from "./ResponsiveContext";
import MobileDashboard from "../../components/all/mobile/MobileDashboard";
import { LessonPlanProvider } from "./data-retrieval/LessonPlanContext";

export default function DashboardContainer({ accessToken }) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [activeSessionId, setActiveSessionId] = useState(null);

  // website navbar = 64, bottom margin = 16
  const dashboardHeight = window.innerHeight - 64 - 16;

  if (isMobile) {
    return (
      <div className="relative">
        <MobileDashboard
          activeSessionId={activeSessionId}
          setActiveSessionId={setActiveSessionId}
          accessToken={accessToken}
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
            activeSessionId={activeSessionId}
            setActiveSessionId={setActiveSessionId}
          />
        </div>
        <div className="flex-grow">
          <LessonPlanProvider
            sessionId={activeSessionId}
            accessToken={accessToken}
          >
            <SessionDetailViewContainer activeSessionId={activeSessionId} />
          </LessonPlanProvider>
        </div>
      </div>
    );
  }
}
