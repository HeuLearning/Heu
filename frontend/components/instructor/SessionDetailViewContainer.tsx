import { useState, useRef, useEffect, useMemo } from "react";
import SidePopUp from "./SidePopUp";
import { usePopUp } from "./PopUpContext";
import XButton from "./XButton";
import ShowMoreButton from "./ShowMoreButton";
import ClassItemDetailed from "./ClassItemDetailed";
import { useResponsive } from "./ResponsiveContext";
import MobileDetailView from "components/instructor/mobile/MobileDetailView";
import SessionDetailContent from "./SessionDetailContent";
import { useSessions } from "./SessionsContext";
import SessionDetailSingle from "./SessionDetailSingle";
import ClassSchedulePopUpContainer from "./ClassSchedulePopUpContent";
import { useLessonPlan } from "./LessonPlanContext";

export default function SessionDetailViewContainer({ activeSessionId }) {
  const { allSessions, getSessionStatus } = useSessions();
  const [isLessonPlanLoaded, setIsLessonPlanLoaded] = useState("loading");

  let lessonPlanData = useLessonPlan();
  const session = useMemo(() => {
    return activeSessionId
      ? allSessions.find((session) => session.id === activeSessionId)
      : null;
  }, [activeSessionId, allSessions]);

  const sessionStatus = useMemo(() => {
    return session ? getSessionStatus(session) : null;
  }, [session, getSessionStatus]);

  useEffect(() => {
    let newState = "loading";

    if (!session) {
      newState = "loading";
    } else if (sessionStatus === "Pending") {
      newState = "not confirmed instructor";
    } else if (sessionStatus === "Canceled") {
      newState = "canceled session";
    } else if (lessonPlanData.error === "lesson plan not found") {
      newState = "no lesson plan";
    } else if (
      !lessonPlanData.isLoading &&
      Object.keys(lessonPlanData.lessonPlan).length > 0
    ) {
      newState = "true";
    }

    if (newState !== isLessonPlanLoaded) {
      setIsLessonPlanLoaded(newState);
    }
  }, [session, sessionStatus, lessonPlanData, isLessonPlanLoaded]);

  const { isMobile, isTablet, isDesktop } = useResponsive();

  const { showPopUp, hidePopUp } = usePopUp();

  const handleShowClassSchedule = () => {
    showPopUp({
      id: "class-schedule-popup",
      content: (
        <SidePopUp className="absolute right-0 top-0 flex flex-col gap-[24px]">
          <div className="flex items-center justify-between font-medium text-typeface_primary text-h3">
            Class Schedule
            <XButton onClick={() => hidePopUp("class-schedule-popup")} />
          </div>
          {lessonPlanData.phases && (
            <ClassSchedulePopUpContainer {...lessonPlanData} />
          )}
        </SidePopUp>
      ),
      container: "#dashboard-container", // Ensure this ID exists in your DOM
      style: {
        overlay: "bg-surface_bg_darkest bg-opacity-[0.08] rounded-[20px]",
      },
      height: "auto",
    });
  };

  if (activeSessionId)
    return (
      <div className="h-full">
        <SessionDetailSingle
          lessonPlanData={lessonPlanData}
          isLessonPlanLoaded={isLessonPlanLoaded}
          activeSessionId={activeSessionId}
          handleShowClassSchedule={handleShowClassSchedule}
        />
      </div>
    );
  else
    return (
      <div className="h-full pl-[24px] pt-[24px]">
        <SessionDetailContent
          lessonPlanData={lessonPlanData}
          isLessonPlanLoaded={isLessonPlanLoaded}
          sessionId={null}
          handleShowClassSchedule={handleShowClassSchedule}
        />
      </div>
    );
}
