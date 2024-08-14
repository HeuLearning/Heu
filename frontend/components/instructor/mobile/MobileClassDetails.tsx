import MobileDetailView from "./MobileDetailView";
import XButton from "../XButton";
import SessionDetailContent from "../SessionDetailContent";
import { useState, useEffect, useRef, useMemo } from "react";
import { useResponsive } from "../ResponsiveContext";
import { useSessions } from "../SessionsContext";
import { format } from "date-fns";
import ClassSchedulePopUpContainer from "../ClassSchedulePopUpContent";
import BackButton from "../BackButton";
import { useLessonPlan } from "../LessonPlanContext";

export default function MobileClassDetails({
  activeSessionId,
  closeClassDetails,
}) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { allSessions, upcomingSessions, getSessionStatus } = useSessions();
  const [isLessonPlanLoaded, setIsLessonPlanLoaded] = useState("loading");
  const [isClassSchedShown, setIsClassSchedShown] = useState(false);

  let lessonPlanData = useLessonPlan();
  const session = useMemo(() => {
    return activeSessionId
      ? allSessions.find((session) => session.id === activeSessionId)
      : null;
  }, [activeSessionId, allSessions]);

  const startDate = new Date(session.start_time);
  const endDate = new Date(session.end_time);

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

  const handleShowClassSchedule = () => {
    setIsClassSchedShown(true);
  };

  const hideClassSchedule = () => {
    setIsClassSchedShown(false);
  };

  return isClassSchedShown ? (
    <div>
      <div className="absolute inset-0 max-h-screen overflow-y-auto">
        <MobileDetailView
          backgroundColor="bg-surface_bg_highlight"
          className="px-[16px] pt-[24px]"
          headerContent={
            <div className="flex items-center gap-[12px]">
              <BackButton onClick={hideClassSchedule} />
              <h3 className="text-typeface_primary text-h3">Class Schedule</h3>
            </div>
          }
        >
          <ClassSchedulePopUpContainer {...lessonPlanData} />
        </MobileDetailView>
      </div>
    </div>
  ) : (
    <div className="absolute inset-0 max-h-screen overflow-y-auto">
      <MobileDetailView
        backgroundColor="bg-surface_bg_highlight"
        className="px-[16px] pt-[24px]"
        headerContent={
          <div className="flex w-full justify-between">
            <h3 className="p-[8px] text-typeface_primary text-h3">
              Class details
            </h3>
            <XButton onClick={() => closeClassDetails()} />
          </div>
        }
        headerContentOnScroll={
          <div className="flex w-full items-center justify-between">
            <div className="flex gap-[16px] pl-[8px]">
              <h3 className="text-typeface_primary text-h3">
                {format(startDate, "MMMM do")}
              </h3>
              <h3 className="text-typeface_secondary text-h3">
                {format(startDate, "h:mma") + " - " + format(endDate, "h:mma")}
              </h3>
            </div>
            <XButton onClick={() => closeClassDetails()} />
          </div>
        }
      >
        <div className="overflow-y-auto">
          <SessionDetailContent
            lessonPlanData={lessonPlanData}
            isLessonPlanLoaded={isLessonPlanLoaded}
            sessionId={activeSessionId}
            handleShowClassSchedule={handleShowClassSchedule}
          />
        </div>
      </MobileDetailView>
    </div>
  );
}
