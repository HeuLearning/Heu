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

export default function MiniClassBlock({
  dateCard = false,
  sessionId,
  setActiveSessionId,
  activeSessionId = false,
  setActiveSessionByDate,
  handleMobileShowClassDetails = null,
  isDaily = false,
}) {
  const { getSessionStatus, upcomingSessions } = useSessions();
  const session = upcomingSessions.find((session) => session.id === sessionId);
  const startDate = new Date(session.start_time);
  const month = format(startDate, "MMM"); // for date card
  const day = format(startDate, "d"); // for date card
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

  const handleConfirm = () => {
    showPopUp({
      id: "confirm-attendance",
      content: (
        <PopUp>
          <div className="space-y-[12px]">
            <h3 className="text-typeface_primary text-h3">
              Confirm attendance
            </h3>
            <p className="text-typeface_primary text-body-regular">
              Would you like to confirm attendance to the following class?
            </p>
          </div>
          <div className="py-[32px]">
            <div
              className={`flex items-center justify-between rounded-[14px] p-[4px]`}
            >
              <div className="flex w-full items-center rounded-[14px] bg-surface_bg_tertiary p-[4px]">
                <DateCard month={month} day={day} />
                <div className={`flex items-center justify-between px-[8px]`}>
                  <div className="">
                    <h1 className="text-typeface_primary text-body-medium">
                      {format(startDate, "eeee")}
                    </h1>
                    <div className="flex items-center gap-[7px]">
                      <h2 className="text-typeface_secondary text-body-medium">
                        {format(startDate, "h:mma") +
                          " - " +
                          format(new Date(session.end_time), "h:mma")}
                      </h2>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-[12px]">
            <Button
              className="button-secondary"
              onClick={() => hidePopUp("confirm-attendance")}
            >
              Cancel
            </Button>
            <Button className="button-primary">Confirm</Button>
          </div>
        </PopUp>
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
    <div className={`space-y-[3px] ${dateCard ? "" : "py-[3px]"}`}>
      <h1
        className={
          activeSessionId === sessionId && isDaily
            ? "text-typeface_primary text-body-semibold"
            : "text-typeface_primary text-body-medium"
        }
      >
        {dateCard
          ? format(startDate, "eeee")
          : `${format(startDate, "eeee, MMMM do")}`}
      </h1>
      <div className="flex items-center gap-[7px]">
        <h2
          className={
            activeSessionId === sessionId && isDaily
              ? "text-typeface_primary text-body-medium"
              : "text-typeface_secondary text-body-medium"
          }
        >
          {format(startDate, "h:mma")}
        </h2>
        <div className="flex items-center gap-[5px]">
          <svg
            width="6"
            height="7"
            viewBox="0 0 6 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="3" cy="3.5" r="3" fill={fillColor} />
          </svg>
          <h2 className={`text-body-semibold ${color}`}>{status}</h2>
        </div>
      </div>
    </div>
  );

  const renderButton = () => {
    if (status === "Pending") {
      return (
        <div className="drop-shadow-50">
          <Button
            className="bg-white text-typeface_primary text-body-semibold-cap-height"
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </div>
      );
    }
    if (status === "Online") {
      return (
        <div className="drop-shadow-50">
          <Button
            className="bg-white text-typeface_primary text-body-semibold-cap-height"
            onClick={handleEnter}
          >
            Enter
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`min-w-[274px] cursor-pointer ${
        dateCard ? styles.dateCard : styles.noDateCard
      } ${styles.mini_class_block} ${
        activeSessionId === sessionId && isDaily ? styles.selected : ""
      }`}
      onClick={() => handleClick(sessionId)}
    >
      {dateCard ? (
        <div className="flex items-center">
          <DateCard month={month} day={day} />
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
