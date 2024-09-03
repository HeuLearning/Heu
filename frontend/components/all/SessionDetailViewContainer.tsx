import { useState, useRef, useEffect, useMemo } from "react";
import SidePopUp from "./popups/SidePopUp";
import { usePopUp } from "./popups/PopUpContext";
import XButton from "./buttons/XButton";
import { useResponsive } from "./ResponsiveContext";
import SessionDetailContent from "./SessionDetailContent";
import { useSessions } from "./data-retrieval/SessionsContext";
import ClassSchedulePopUpContainer from "./popups/ClassSchedulePopUpContent";
import { useLessonPlan } from "./data-retrieval/LessonPlanContext";

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
    // Get the container element
    const dashboardContainer = document.getElementById("dashboard-container");

    // Calculate the height
    const containerHeight = dashboardContainer.offsetHeight;

    showPopUp({
      id: "class-schedule-popup",
      content: (
        <SidePopUp
          headerContent={
            <div className="flex items-center justify-between font-medium text-typeface_primary text-h3">
              Class Schedule
              <XButton onClick={() => hidePopUp("class-schedule-popup")} />
            </div>
          }
          className="absolute right-0 top-0 flex flex-col"
          height={containerHeight}
        >
          {lessonPlanData.phases && (
            <ClassSchedulePopUpContainer {...lessonPlanData} />
          )}
        </SidePopUp>
      ),
      container: "#dashboard-container", // Ensure this ID exists in your DOM
      style: {
        overlay: "overlay-low rounded-[20px]",
      },
      height: "auto",
    });
  };

  return (
    <div className="h-full pl-[24px] pt-[24px]">
      <SessionDetailContent
        lessonPlanData={lessonPlanData}
        isLessonPlanLoaded={isLessonPlanLoaded}
        activeSessionId={activeSessionId}
        handleShowClassSchedule={handleShowClassSchedule}
      />
    </div>
  );
}