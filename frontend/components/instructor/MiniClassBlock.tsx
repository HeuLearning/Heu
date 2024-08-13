import Button from "./Button";
import DateCard from "./DateCard";
import PopUp from "./PopUp";
import { useState } from "react";
import { usePopUp } from "./PopUpContext";
import { useRouter } from "next/router";
import styles from "./MiniClassBlock.module.css";
import { useResponsive } from "./ResponsiveContext";
import { useSessions } from "./SessionsContext";
import { format } from "date-fns";
import Dot from "./Dot";
import AttendancePopUp from "./AttendancePopUp";
import Placeholder from "./Placeholder";

export default function MiniClassBlock({
  dateCard = false,
  sessionId,
  setActiveSessionId,
  activeSessionId = false,
  handleMobileShowClassDetails = null,
  isDaily = false,
  arrow = false,
}) {
  const { getSessionStatus, upcomingSessions, confirmSession } = useSessions();
  const session = upcomingSessions.find((session) => session.id === sessionId);
  const startDate = new Date(session.start_time);
  const router = useRouter();

  const { isMobile, isTablet, isDesktop } = useResponsive();

  let color = "";
  let fillColor = "";
  const status = getSessionStatus(session);
  if (status === "Confirmed") {
    color = "text-status_fg_positive";
    fillColor = "var(--status_fg_positive)";
  } else if (status === "Pending") {
    color = "text-typeface_primary";
    fillColor = "#292929";
  } else if (status === "Online") {
    color = "text-status_fg_positive";
    fillColor = "var(--status_fg_positive)";
  } else if (status === "Canceled") {
    color = "text-typeface_tertiary";
    fillColor = "var(--typeface_tertiary)";
  }

  const { showPopUp, hidePopUp } = usePopUp();

  const handleConfirmPopUp = () => {
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
        overlay: "bg-surface_bg_darkest bg-opacity-[0.5]",
      },
      height: "276px",
    });
  };

  const handleEnter = () => {
    router.push("/instructor/" + sessionId);
  };

  const handleClick = (sessionId) => {
    setActiveSessionId(sessionId);
    if (isMobile) {
      handleMobileShowClassDetails(sessionId);
    }
  };

  const renderContent = () => (
    <div className={`space-y-[3px]`}>
      {sessionId ? (
        <div className="flex gap-[4px] pl-[4px]">
          <h1
            className={
              activeSessionId === sessionId && isDaily
                ? "text-typeface_primary text-body-semibold"
                : status === "Canceled"
                ? "text-typeface_secondary text-body-medium"
                : "text-typeface_primary text-body-medium"
            }
          >
            {dateCard || arrow
              ? format(startDate, "eee")
              : `${format(startDate, "MMM do, eee")}`}
          </h1>
          <h2
            className={
              status === "Canceled"
                ? "text-typeface_tertiary text-body-medium"
                : "text-typeface_secondary text-body-medium"
            }
          >
            {format(startDate, "h:mma")}
          </h2>
        </div>
      ) : (
        <Placeholder width={104} height={10} />
      )}
      <div className="flex items-center">
        <Dot color={sessionId ? fillColor : "var(--surface_bg_secondary)"} />
        {sessionId ? (
          <h2 className={`text-body-semibold ${color}`}>{status}</h2>
        ) : (
          <Placeholder width={60} height={10} />
        )}
      </div>
    </div>
  );

  const renderButton = () => {
    if (status === "Pending") {
      return (
        <div className="rounded-[10px] shadow-25">
          <Button
            className="bg-white text-typeface_primary text-body-semibold-cap-height"
            onClick={handleConfirmPopUp}
          >
            Confirm
          </Button>
        </div>
      );
    }
    if (status === "Online") {
      return (
        <div className="rounded-[10px] shadow-25">
          <Button
            className="bg-white text-typeface_primary text-body-semibold-cap-height"
            onClick={handleEnter}
          >
            Enter class
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`min-w-[282px] cursor-pointer ${
        dateCard || arrow ? styles.dateCard : styles.noDateCard
      } ${styles.mini_class_block} ${
        activeSessionId === sessionId && isDaily ? styles.selected : ""
      }`}
      onClick={() => handleClick(sessionId)}
    >
      {dateCard ? (
        <div className="flex items-center">
          <DateCard
            month={format(startDate, "MMM")}
            day={format(startDate, "d")}
          />
          <div className={`flex items-center justify-between pl-[8px]`}>
            {renderContent()}
          </div>
        </div>
      ) : arrow ? (
        <div className="flex items-center">
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M29 16C29 15.4477 28.5523 15 28 15C27.4477 15 27 15.4477 27 16L29 16ZM27 16L27 22L29 22L29 16L27 16ZM34 29L44 29L44 27L34 27L34 29ZM27 22C27 25.866 30.134 29 34 29L34 27C31.2386 27 29 24.7614 29 22L27 22Z"
              fill="var(--surface_bg_darker)"
            />
            <path
              d="M39 24L43.6096 27.6877C43.8097 27.8478 43.8097 28.1522 43.6096 28.3123L39 32"
              stroke="var(--surface_bg_darker)"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <div className={`flex items-center justify-between pl-[8px]`}>
            {renderContent()}
          </div>
        </div>
      ) : (
        <div className={`flex items-center justify-between`}>
          {renderContent()}
        </div>
      )}
      {renderButton()}
    </div>
  );
}
