import Button from "./buttons/Button";
import DateCard from "./DateCard";
import { usePopUp } from "./popups/PopUpContext";
import { useRouter } from "next/navigation";
import styles from "./MiniClassBlock.module.css";
import { useResponsive } from "./ResponsiveContext";
import { useSessions } from "./data-retrieval/SessionsContext";
import { format } from "date-fns";
import Dot from "./Dot";
import AttendancePopUp from "./popups/AttendancePopUp";
import Placeholder from "./Placeholder";
import dictionary from "../../dictionary.js";
import { getGT } from "gt-next";

interface MiniClassBlockProps {
  dateCard?: boolean;
  sessionId: string;
  setActiveSessionId: (sessionId: string) => void;
  activeSessionId?: string | null;
  handleMobileShowClassDetails?: (sessionId: string) => void;
  isDaily?: boolean;
  arrow?: boolean;
}

export default function MiniClassBlock({
  dateCard = false,
  sessionId,
  setActiveSessionId,
  activeSessionId,
  handleMobileShowClassDetails = () => {},
  isDaily = false,
  arrow = false,
}: MiniClassBlockProps) {
  const { getSessionStatus, upcomingSessions, allSessions, confirmSession } =
    useSessions();
  const t = getGT();
  let session: any;
  let startDate: Date | null;
  if (sessionId === "") {
    session = null;
    startDate = null;
  } else {
    session = allSessions.find((session) => session.id === sessionId);
    startDate = new Date(session.start_time);
  }
  const router = useRouter();

  const { isMobile, isTablet, isDesktop } = useResponsive();

  let color = "";
  let fillColor = "";
  const status = session ? getSessionStatus(session) : null;

  if (status === "Confirmed") {
    color = "text-status_fg_positive";
    fillColor = "var(--status_fg_positive)";
  } else if (
    status === "Pending" ||
    status === "Enrolled" ||
    status === "Waitlisted" ||
    status === "Available" ||
    status === "Class full"
  ) {
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
        overlay: "overlay-high",
      },
      height: "276px",
    });
  };

  const handleEnter = () => {
    router.push(`${sessionId}`);
  };

  const handleEnroll = () => {
    showPopUp({
      id: "enroll-session-poup",
      content: (
        <AttendancePopUp
          session={session}
          action="enroll"
          popUpId="enroll-session-poup"
        />
      ),
      container: null, // Ensure this ID exists in your DOM
      style: {
        overlay: "overlay-high",
      },
      height: "276px",
    });
  };

  const handleClick = (sessionId: string) => {
    setActiveSessionId(sessionId);
    if (isMobile) {
      handleMobileShowClassDetails(sessionId);
    }
  };

  const renderContent = () => (
    <div className={`${isMobile ? "" : "space-y-[3px]"}`}>
      {sessionId && startDate ? (
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
              ? startDate.toLocaleDateString("default", { weekday: "short" })
              : `${startDate.toLocaleDateString("default", {
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}`}
          </h1>
          <h2
            className={
              status === "Canceled"
                ? "whitespace-nowrap text-typeface_tertiary text-body-medium"
                : "whitespace-nowrap text-typeface_secondary text-body-medium"
            }
          >
            {startDate.toLocaleTimeString("default", {
              hour: "numeric",
              minute: "2-digit",
              hour12: undefined,
            })}
          </h2>
        </div>
      ) : (
        <Placeholder width={104} height={10} />
      )}
      <div className="flex items-center">
        {session && getSessionStatus(session) === "Attended" ? (
          <div className="pr-[4px]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.5 8L6.5 11L12.5 5"
                stroke="var(--typeface_primary)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        ) : (
          <Dot color={sessionId ? fillColor : "var(--surface_bg_secondary)"} />
        )}
        {sessionId ? (
          <h2 className={`text-body-semibold ${color}`}>
            {status === "Enrolled"
              ? t("status.pending")
              : status === "Class full"
                ? t("status.class_full")
                : t(`status.${status}`)}
          </h2>
        ) : (
          <Placeholder width={60} height={10} />
        )}
      </div>
    </div>
  );

  const renderButton = () => {
    if (status === "Pending" || status === "Enrolled") {
      return (
        <div className="rounded-[10px] shadow-25">
          <Button
            className="bg-white text-typeface_primary text-body-semibold-cap-height"
            onClick={handleConfirmPopUp}
          >
            {t("button_content.confirm")}
          </Button>
        </div>
      );
    } else if (status === "Online") {
      return (
        <div className="rounded-[10px] shadow-25">
          <Button
            className="whitespace-nowrap bg-white text-typeface_primary text-body-semibold-cap-height"
            onClick={handleEnter}
          >
            {t("button_content.enter_class")}
          </Button>
        </div>
      );
    } else if (status === "Available") {
      return (
        <div className="rounded-[10px] shadow-25">
          <Button
            className="whitespace-nowrap bg-white text-typeface_primary text-body-semibold-cap-height"
            onClick={handleEnroll}
          >
            {t("button_content.enroll")}
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`min-w-[282px] ${
        dateCard || arrow ? styles.dateCard : styles.noDateCard
      } ${isMobile ? "-mr-[8px]" : ""} ${session ? styles.mini_class_block : "cursor-auto"} ${
        activeSessionId === sessionId && isDaily ? styles.selected : ""
      }`}
      onClick={session ? () => handleClick(sessionId) : () => {}}
    >
      {dateCard ? (
        <div className="flex items-center">
          <DateCard
            month={
              startDate
                ? startDate.toLocaleDateString("default", { month: "short" })
                : new Date().toLocaleDateString("default", { month: "short" })
            }
            day={
              startDate
                ? startDate.toLocaleDateString("default", { day: "numeric" })
                : new Date().toLocaleDateString("default", { day: "numeric" })
            }
          />
          <div
            className={`flex items-center justify-between ${
              isMobile ? "pl-[12px]" : "pl-[8px]"
            }`}
          >
            {renderContent()}
          </div>
        </div>
      ) : arrow ? (
        isMobile ? (
          <div className="flex items-center">
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M33 16C33 15.4477 32.5523 15 32 15C31.4477 15 31 15.4477 31 16L33 16ZM31 16L31 26L33 26L33 16L31 16ZM38 33L48 33L48 31L38 31L38 33ZM31 26C31 29.866 34.134 33 38 33L38 31C35.2386 31 33 28.7614 33 26L31 26Z"
                fill="var(--surface_bg_darker)"
              />
              <path
                d="M43 28L47.6096 31.6877C47.8097 31.8478 47.8097 32.1522 47.6096 32.3123L43 36"
                stroke="var(--surface_bg_darker)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <div className={`flex items-center justify-between pl-[12px]`}>
              {renderContent()}
            </div>
          </div>
        ) : (
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
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <div className={`flex items-center justify-between pl-[8px]`}>
              {renderContent()}
            </div>
          </div>
        )
      ) : (
        <div className={`flex items-center justify-between`}>
          {renderContent()}
        </div>
      )}
      {renderButton()}
    </div>
  );
}
