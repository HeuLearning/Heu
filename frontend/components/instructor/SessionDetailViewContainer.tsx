import { useState, useRef, useEffect } from "react";
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

export default function SessionDetailViewContainer({
  activeSessionId,
}) {
  const { upcomingSessions } = useSessions();
  const [isLessonPlanLoaded, setIsLessonPlanLoaded] = useState("loading");
  const [activeSessionKey, setActiveSessionKey] = useState("");

  let lessonPlanData = useLessonPlan();

  useEffect(() => {
    let isMounted = true;

    console.log(lessonPlanData.lessonPlan);

    const checkLessonPlanData = () => {
      if (isMounted) {
        if (Object.keys(lessonPlanData.lessonPlan).length === 0) {
          setIsLessonPlanLoaded("no lesson plan");
        } else if (Object.keys(lessonPlanData.lessonPlan).length > 0) {
          setIsLessonPlanLoaded("true");
        } else {
          setIsLessonPlanLoaded("loading");
        }
      }
    };

    checkLessonPlanData();

    return () => {
      isMounted = false;
    };
  }, [lessonPlanData.lessonPlan.lesson_plan_id, activeSessionKey]);

  useEffect(() => {
    setIsLessonPlanLoaded("loading");
  }, [activeSessionId]);

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
