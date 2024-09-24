import { format } from "date-fns";
import DateCard from "../DateCard";
import PopUpContainer from "./PopUpContainer";
import { usePopUp } from "./PopUpContext";
import {
  useLearnerSessions,
  useSessions,
} from "../data-retrieval/SessionsContext";
import styles from "../MiniClassBlock.module.css";
import { Yeseva_One } from "next/font/google";

export default function AttendancePopUp({ session, action, popUpId }) {
  const startDate = new Date(session.start_time);
  const { showPopUp, hidePopUp } = usePopUp();
  const { confirmSession, cancelSession } = useSessions();

  const handleConfirmSession = (sessionId) => {
    confirmSession(sessionId);
    window.location.reload();
  };

  const handleCancelSessionPopUp = (sessionId) => {
    hidePopUp(popUpId);
    cancelSession(sessionId);
    showPopUp({
      id: "cancel-class-confirmation-popup",
      content: (
        <PopUpContainer
          header="Class canceled"
          primaryButtonText="Continue"
          primaryButtonOnClick={handleCancelSession}
          popUpId="cancel-class-confirmation-popup"
        >
          <p className="text-typeface_primary text-body-regular">
            This class has been canceled and removed from your schedule.
          </p>
        </PopUpContainer>
      ),
      container: null, // Ensure this ID exists in your DOM
      style: {
        overlay: "overlay-high",
      },
      height: "auto",
    });
  };

  const handleCancelSession = (sessionId) => {};

  if (action === "enroll" || action === "waitlist") {
    const { enrollSession, waitlistSession } = useLearnerSessions();
    const handleEnrollSession = (sessionId) => {
      enrollSession(sessionId);
      window.location.reload();
    };
    const handleWaitlistSession = (sessionId) => {
      waitlistSession(sessionId);
      window.location.reload();
    };
    return (
      <PopUpContainer
        header={
          action === "enroll" ? "Enroll in this class" : "Join waiting list"
        }
        primaryButtonText={action === "enroll" ? "Enroll" : "Join waiting list"}
        secondaryButtonText={"Cancel"}
        primaryButtonOnClick={
          action === "enroll"
            ? () => handleEnrollSession(session.id)
            : () => handleWaitlistSession(session.id)
        }
        secondaryButtonOnClick={() => hidePopUp(popUpId)}
        popUpId={popUpId}
      >
        <p className="text-typeface_primary text-body-regular">
          {action === "enroll"
            ? "Are you sure you'd like to add this class to your schedule?"
            : "This class is currently full. Upon joining the waiting list, if a spot becomes available, we'll notify you for you to confirm your attendance."}
        </p>
        <div className="relative pt-[32px]">
          <div
            className={`${styles.confirm_class_block} flex w-full items-center rounded-[14px]`}
          >
            <DateCard
              month={startDate.toLocaleDateString("default", {
                month: "short",
              })}
              day={startDate.toLocaleDateString("default", { day: "numeric" })}
            />
            <div className={`flex items-center justify-between px-[8px]`}>
              <div className="flex gap-[4px] pl-[4px]">
                <h1 className="text-typeface_primary text-body-semibold">
                  {startDate.toLocaleDateString("default", { weekday: "long" })}
                </h1>
                <h1 className="text-typeface_secondary text-body-medium">
                  {startDate.toLocaleTimeString("default", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: undefined,
                  }) +
                    " - " +
                    new Date(session.end_time).toLocaleTimeString("default", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: undefined,
                    })}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </PopUpContainer>
    );
  }

  return (
    <PopUpContainer
      header={action === "confirm" ? "Confirm attendance" : "I can't attend"}
      primaryButtonText={action === "confirm" ? "Confirm" : "I can't attend"}
      secondaryButtonText={action === "confirm" ? "Cancel" : "Swap class"}
      primaryButtonOnClick={
        action === "confirm"
          ? () => handleConfirmSession(session.id)
          : () => handleCancelSessionPopUp(session.id)
      }
      secondaryButtonOnClick={
        action === "confirm" ? () => hidePopUp(popUpId) : () => {}
      }
      popUpId={popUpId}
    >
      <p className="text-typeface_primary text-body-regular">
        {`Would you like to ${
          action === "confirm" ? "confirm" : "cancel"
        } attendance to the following class?`}
      </p>
      <div className="relative pt-[32px]">
        <div
          className={`${styles.confirm_class_block} flex w-full items-center rounded-[14px]`}
        >
          <DateCard
            month={startDate.toLocaleDateString("default", { month: "short" })}
            day={startDate.toLocaleDateString("default", { day: "numeric" })}
          />
          <div className={`flex items-center justify-between px-[8px]`}>
            <div className="flex gap-[4px] pl-[4px]">
              <h1 className="text-typeface_primary text-body-semibold">
                {startDate.toLocaleDateString("default", { weekday: "long" })}
              </h1>
              <h1 className="text-typeface_secondary text-body-medium">
                {startDate.toLocaleTimeString("default", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: undefined,
                }) +
                  " - " +
                  new Date(session.end_time).toLocaleTimeString("default", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: undefined,
                  })}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </PopUpContainer>
  );
}
