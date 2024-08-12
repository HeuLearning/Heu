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
  setActiveSessionByDate,
  handleMobileShowClassDetails = null,
  isDaily = false,
  placeholder = false,
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
    setActiveSessionByDate(null);
    if (isMobile) {
      handleMobileShowClassDetails(sessionId);
    }
  };

  const renderContent = () => (
    <div className={`space-y-[3px]`}>
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
          {activeSessionId ? (
            dateCard ? (
              format(startDate, "eee")
            ) : (
              `${format(startDate, "MMM do, eee")}`
            )
          ) : (
            <Placeholder width={104} height={10} />
          )}
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
      <div className="flex items-center">
        <Dot
          color={activeSessionId ? fillColor : "var(--surface_bg_secondary)"}
        />
        {activeSessionId ? (
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
        dateCard ? styles.dateCard : styles.noDateCard
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
      ) : (
        <div className={`flex items-center justify-between`}>
          {renderContent()}
        </div>
      )}
      {renderButton()}
    </div>
  );
}
