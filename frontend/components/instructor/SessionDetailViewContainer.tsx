import { useState, useRef, useEffect } from "react";
import PopUp from "./PopUp";
import { usePopUp } from "./PopUpContext";
import XButton from "./XButton";
import ShowMoreButton from "./ShowMoreButton";
import ClassItemDetailed from "./ClassItemDetailed";
import { useResponsive } from "./ResponsiveContext";
import MobileDetailView from "components/instructor/mobile/MobileDetailView";
import SessionDetailContent from "./SessionDetailContent";
import { useSessions } from "./SessionsContext";
import SessionDetailTabs from "./SessionDetailTabs";
import SessionDetailSingle from "./SessionDetailSingle";
import ClassSchedulePopUpContainer from "./ClassSchedulePopUpContent";

export default function SessionDetailViewContainer({
  activeSessionId,
  activeSessionByDate,
}) {
  const { upcomingSessions } = useSessions();

  let session;
  if (activeSessionId) {
    session = upcomingSessions.find(
      (session) => session.id === activeSessionId
    );
  }

  const { isMobile, isTablet, isDesktop } = useResponsive();

  const { showPopUp, hidePopUp } = usePopUp();

  const phase1Modules = [
    {
      id: 1,
      title: "Instruction",
      description: "Past perfect conjugation table",
    },
    {
      id: 2,
      title: "Individual exercise",
      description: "Kitchen vocabulary",
    },
    {
      id: 3,
      title: "Instruction",
      description:
        "Harder past perfect questions/examples, interactive between instructor + learners",
    },
    {
      id: 4,
      title: "Individual exercise",
      description:
        "Individual questions testing past perfect with kitchen vocabulary",
    },
  ];

  const handleShowClassSchedule = () => {
    showPopUp({
      id: "class-schedule-popup",
      content: (
        <PopUp className="absolute right-0 top-0 flex flex-col gap-[24px]">
          <div className="flex items-center justify-between font-medium text-typeface_primary text-h3">
            Class Schedule
            <XButton onClick={() => hidePopUp("class-schedule-popup")} />
          </div>
          <ClassSchedulePopUpContainer modules={phase1Modules} />
        </PopUp>
      ),
      container: "#dashboard-container", // Ensure this ID exists in your DOM
      style: {
        overlay: "bg-surface_bg_darkest bg-opacity-[0.08] rounded-[20px]",
      },
      height: "auto",
    });
  };

  if (activeSessionByDate)
    return (
      <div className="h-full">
        <SessionDetailTabs
          activeSessionByDate={activeSessionByDate}
          handleShowClassSchedule={handleShowClassSchedule}
        />
      </div>
    );
  else if (activeSessionId)
    return (
      <div className="h-full">
        <SessionDetailSingle
          activeSessionId={activeSessionId}
          handleShowClassSchedule={handleShowClassSchedule}
        />
      </div>
    );
  else
    return (
      <div className="h-full pl-[24px] pt-[24px]">
        <SessionDetailContent
          sessionId={null}
          handleShowClassSchedule={handleShowClassSchedule}
        />
      </div>
    );
}
