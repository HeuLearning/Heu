import MobileDetailView from "./MobileDetailView";
import XButton from "../buttons/XButton";
import SessionDetailContent from "../SessionDetailContent";
import { useState, useEffect, useMemo } from "react";
import { useResponsive } from "../ResponsiveContext";
import { useSessions } from "../data-retrieval/SessionsContext";
import ClassSchedulePopUpContainer from "../popups/ClassSchedulePopUpContent";
import BackButton from "../buttons/BackButton";
import { useLessonPlan } from "../data-retrieval/LessonPlanContext";
import ButtonBar from "./ButtonBar";
import MenuItem from "../buttons/MenuItem";
import { usePopUp } from "../popups/PopUpContext";
import { useRouter } from "next/router";
import { useUserRole } from "../data-retrieval/UserRoleContext";
import { differenceInDays } from "date-fns";
import AttendancePopUp from "../popups/AttendancePopUp";
import RSVPSelector from "../buttons/RSVPSelector";
import PopUpContainer from "../popups/PopUpContainer";
import Textbox from "components/exercises/Textbox";

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
  const { userRole } = useUserRole();

  const router = useRouter();

  const { hidePopUp, showPopUp } = usePopUp();

  console.log("active session id" + activeSessionId);
  let lessonPlanData = useLessonPlan();
  const session = useMemo(() => {
    return activeSessionId
      ? allSessions.find((session) => session.id === activeSessionId)
      : null;
  }, [activeSessionId, allSessions]);

  const sessionStatus = useMemo(() => {
    return session ? getSessionStatus(session) : null;
  }, [session, getSessionStatus]);

  const startDate = new Date(session.start_time);
  const differenceInDaysToStart = differenceInDays(startDate, new Date());

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

  const showConfirmAttendancePopUp = () => {
    showPopUp({
      id: "confirm-attendance",
      content: (
        <AttendancePopUp
          session={session}
          action="confirm"
          popUpId="confirm-attendance"
        />
      ),
      container: null, // Ensure this ID exists in your DOM
      style: {
        overlay: "overlay-high",
      },
      height: "276px",
    });
  };

  const showCancelAttendancePopUp = () => {
    showPopUp({
      id: "cancel-attendance",
      content: (
        <AttendancePopUp
          session={session}
          action="cancel"
          popUpId="cancel-attendance"
        />
      ),
      container: null, // Ensure this ID exists in your DOM
      style: {
        overlay: "overlay-high",
      },
      height: "276px",
    });
  };

  const displayMobileRSVPOptions = () => {
    showPopUp({
      id: "mobile-confirm-attendance",
      // button bar 65 px + 8px
      content: (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              hidePopUp("mobile-confirm-attendance");
            }}
          />
          <div className="fixed bottom-[73px] z-50 w-full px-[8px]">
            <div className="flex w-full flex-col rounded-[10px] bg-surface_bg_highlight p-[4px]">
              <MenuItem onClick={showConfirmAttendancePopUp}>
                Confirm attendance
              </MenuItem>
              <MenuItem onClick={showCancelAttendancePopUp}>
                I can't attend
              </MenuItem>
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
    showPopUp({
      id: "class-code-pop-up",
      content: (
        <PopUpContainer
          header="Enter class code"
          primaryButtonText="Enter class"
          primaryButtonOnClick={() => {
            router.push(`${session.id}`);
          }}
          popUpId="class-code-pop-up"
        >
          <p className="text-body-regular">
            Please enter the 6-digit code provided by your instructor in order
            to enter this class.
          </p>
          <div className="flex gap-[8px]">
            {Array.from({ length: 6 }, (_, i) => (
              <Textbox size="small" width="40" onChange={null} value="" />
            ))}
          </div>
        </PopUpContainer>
      ),
      container: null, // Ensure this ID exists in your DOM
      style: {
        overlay: "overlay-high",
      },
      height: "276px",
    });
  };

  const showEnrollPopUp = () => {
    showPopUp({
      id: "enroll-pop-up",
      content: (
        <AttendancePopUp
          session={session}
          action="enroll"
          popUpId="enroll-pop-up"
        />
      ),
      container: null, // Ensure this ID exists in your DOM
      style: {
        overlay: "overlay-high",
      },
      height: "276px",
    });
  };

  const showWaitlistPopUp = () => {};

  const getActionItem = () => {
    if (session) {
      if (userRole === "in") {
        if (
          getSessionStatus(session) === "Canceled" ||
          getSessionStatus(session) === "Confirmed" ||
          getSessionStatus(session) === "Attended"
        ) {
          return (
            <ButtonBar
              primaryButtonText="RSVP"
              primaryButtonOnClick={displayMobileRSVPOptions}
            />
          );
        } else if (getSessionStatus(session) === "Online") {
          return (
            <ButtonBar
              primaryButtonText="Join class"
              primaryButtonOnClick={handleEnterClass}
            />
          );
        } else if (
          new Date(session.end_time) < new Date() &&
          getSessionStatus(session) !== "Attended"
        ) {
          // if session was in the past and was not attended
          return null;
        } else if (differenceInDaysToStart <= 7) {
          return (
            <ButtonBar
              primaryButtonText="RSVP"
              primaryButtonOnClick={displayMobileRSVPOptions}
            />
          );
        } else return null;
      } else if (userRole === "st") {
        console.log("session status", getSessionStatus(session));
        if (getSessionStatus(session) === "Available") {
          return (
            <ButtonBar
              primaryButtonText="Enroll"
              primaryButtonOnClick={showEnrollPopUp}
            />
          );
        } else if (getSessionStatus(session) === "Class full") {
          return (
            <ButtonBar
              primaryButtonText="Join waiting list"
              primaryButtonOnClick={showWaitlistPopUp}
            />
          );
        } else if (
          getSessionStatus(session) === "Enrolled" &&
          differenceInDaysToStart <= 7
        ) {
          return (
            <ButtonBar
              primaryButtonText="RSVP"
              primaryButtonOnClick={displayMobileRSVPOptions}
            />
          );
        } else if (
          getSessionStatus(session) === "Enrolled" &&
          differenceInDaysToStart > 7
        ) {
          return (
            <ButtonBar
              primaryButtonText="RSVP"
              primaryButtonOnClick={null}
              disabled={true}
            />
          );
        } else if (
          getSessionStatus(session) === "Confirmed" ||
          getSessionStatus(session) === "Waitlisted" ||
          getSessionStatus(session) === "Canceled"
        ) {
          return (
            <ButtonBar
              status={getSessionStatus(session)}
              primaryButtonText=""
              primaryButtonOnClick={null}
            />
          );
        }
      }
    }
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
                variation="button-secondary"
                onClick={hideClassSchedule}
                className="absolute left-0"
              />
              <h3 className="text-typeface_primary text-body-medium">
                Class Schedule
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
        buttonBar={true}
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
            activeSessionId={activeSessionId}
            handleShowClassSchedule={handleShowClassSchedule}
          />
        </div>
      </MobileDetailView>
      {session && <div className="relative">{getActionItem()}</div>}
    </div>
  );
}
