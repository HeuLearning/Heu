import MobileDetailView from "./MobileDetailView";
import XButton from "../XButton";
import SessionDetailContent from "../SessionDetailContent";
import { useState, useEffect, useMemo } from "react";
import { useResponsive } from "../ResponsiveContext";
import { useSessions } from "../SessionsContext";
import { format } from "date-fns";
import ClassSchedulePopUpContainer from "../ClassSchedulePopUpContent";
import BackButton from "../BackButton";
import { useLessonPlan } from "../LessonPlanContext";
import ButtonBar from "./ButtonBar";
import MenuItem from "../MenuItem";
import { usePopUp } from "../PopUpContext";
import { useRouter } from "next/router";

export default function MobileClassDetails({
  activeSessionId,
  closeClassDetails,
}) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const {
    allSessions,
    upcomingSessions,
    confirmSession,
    cancelSession,
    getSessionStatus,
  } = useSessions();
  const [isLessonPlanLoaded, setIsLessonPlanLoaded] = useState("loading");
  const [isClassSchedShown, setIsClassSchedShown] = useState(false);
  const [isRSVPOptionsShown, setIsRSVPOptionsShown] = useState(false);

  const router = useRouter();

  const { hidePopUp, showPopUp } = usePopUp();

  console.log("active session id" + activeSessionId);
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

  console.log(session.id);

  useEffect(() => {
    let newState = "loading";
    console.log("SESSION" + session.id);
    console.log(sessionStatus);
    console.log(lessonPlanData);

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

  const handleConfirmAttendance = (sessionId) => {
    confirmSession(sessionId);
    window.location.reload();
  };

  const displayMobileRSVPOptions = () => {
    setIsRSVPOptionsShown(true);
    showPopUp({
      id: "mobile-confirm-attendance",
      // button bar 65 px + 8px
      content: (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              hidePopUp("mobile-confirm-attendance");
              setIsRSVPOptionsShown(false);
            }}
          />
          <div className="fixed bottom-[73px] z-50 w-full p-[8px]">
            <div className="flex w-full flex-col rounded-[10px] bg-surface_bg_highlight p-[4px]">
              <MenuItem onClick={() => handleConfirmAttendance(session.id)}>
                Confirm attendance
              </MenuItem>
              <MenuItem onClick={""}>I can't attend</MenuItem>
            </div>
          </div>
        </>
      ),
      container: null, // Ensure this ID exists in your DOM
      style: {
        overlay: "overlay-medium",
      },
      height: "auto",
    });
  };

  const handleEnterClass = () => {
    router.push(`/instructor/${session.id}`);
  };

  return isClassSchedShown ? (
    <div>
      <div className="absolute inset-0 max-h-screen overflow-y-auto">
        <MobileDetailView
          backgroundColor="bg-surface_bg_highlight"
          className="px-[16px] pt-[16px]"
          headerContent={
            <div className="flex h-[44px] w-full items-center justify-center">
              <BackButton
                onClick={hideClassSchedule}
                className="absolute left-0"
              />
              <h3 className="text-typeface_primary text-body-medium">
                Class schedule
              </h3>
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
        buttonBar={
          (session && getSessionStatus(session) === "Pending") ||
          getSessionStatus(session) === "Online"
            ? true
            : false
        }
        backgroundColor="bg-surface_bg_highlight"
        className="px-[16px] pt-[16px]"
        headerContent={
          <div className="relative flex h-[44px] w-full items-center justify-center">
            <h3 className="text-typeface_primary text-body-medium-mobile">
              Class details
            </h3>
            <XButton
              variation="button-secondary"
              onClick={() => closeClassDetails()}
              className="absolute right-0"
            />
          </div>
        }
      >
        <div className="overflow-y-auto pt-[16px]">
          <SessionDetailContent
            lessonPlanData={lessonPlanData}
            isLessonPlanLoaded={isLessonPlanLoaded}
            sessionId={activeSessionId}
            handleShowClassSchedule={handleShowClassSchedule}
          />
        </div>
      </MobileDetailView>
      {!session ? (
        <div>loading</div>
      ) : (
        (getSessionStatus(session) === "Pending" ||
          getSessionStatus(session) === "Online") && (
          <div className="relative">
            {session && getSessionStatus(session) === "Pending" ? (
              <ButtonBar
                primaryButtonText="RSVP"
                primaryButtonOnClick={displayMobileRSVPOptions}
              />
            ) : getSessionStatus(session) === "Online" ? (
              <div>
                <ButtonBar
                  primaryButtonText="Enter class"
                  primaryButtonOnClick={handleEnterClass}
                />
              </div>
            ) : null}
          </div>
        )
      )}
    </div>
  );
}
