import { useState, useEffect, useRef } from "react";
import Button from "./Button";
import Divider from "../Divider";
import styles from "./RSVPSelector.module.css";
import MenuItem from "./MenuItem";
import { useSessions } from "../data-retrieval/SessionsContext";
import Dot from "../Dot";
import { usePopUp } from "../popups/PopUpContext";
import AttendancePopUp from "../popups/AttendancePopUp";
import { useUserRole } from "../data-retrieval/UserRoleContext";
import dictionary from "@/dictionary.js";
import { getGT } from "gt-next";

interface RSVPSelectorProps {
  session: any;
  shouldSpan?: boolean;
}

export default function RSVPSelector({ session, shouldSpan = false }: RSVPSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAttendancePopUpOpen, setIsAttendancePopUpOpen] = useState(false);
  const [lastAction, setLastAction] = useState<"confirm" | "cantAttend" | null>(null);
  const { confirmSession, getSessionStatus } = useSessions();
  const { userRole } = useUserRole();
  
  const t = getGT();
  const status = getSessionStatus(session);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (
        dropdownRef.current &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

  const { showPopUp } = usePopUp();

  const handleConfirmPopUp = () => {
    setLastAction("confirm");
    setIsAttendancePopUpOpen(true);
    showPopUp({
      id: "confirm-attendance",
      content: (
        <AttendancePopUp
          session={session}
          action="confirm"
          popUpId="confirm-attendance"
        />
      ),
      container: null,
      style: {
        overlay: "overlay-high",
      },
      height: "276px",
    });
  };

  const handleCantAttend = () => {
    setLastAction("cantAttend");
    setIsAttendancePopUpOpen(true);
    showPopUp({
      id: "cant-attend",
      content: (
        <AttendancePopUp
          session={session}
          action="can't attend"
          popUpId="cant-attend"
        />
      ),
      container: null,
      style: {
        overlay: "overlay-high",
      },
      height: "276px",
    });
  };

  const rsvpButtonHeight = "h-[48px]";
  const popupButtonClasses = `w-full ${rsvpButtonHeight} bg-white text-typeface_primary text-body-semibold-cap-height font-semibold border border-gray-200 hover:bg-gray-100 transition-colors duration-200`;

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  if (status === "Confirmed" || status === "Canceled") {
    return (
      <div className={`flex items-center rounded-[10px] bg-action_bg_tertiary py-[8px] pl-[8px] pr-[12px] text-typeface_primary text-body-semibold-cap-height ${shouldSpan ? 'w-full' : ''}`}>
        <Dot
          color={
            status === "Confirmed"
              ? "var(--status_fg_positive)"
              : "var(--typeface_tertiary)"
          }
        />
        {t("status." + status.toLowerCase())}
      </div>
    );
  } else if (status === "Attended") {
    return (
      <div className={`flex items-center gap-[4px] rounded-[10px] bg-action_bg_tertiary py-[8px] pl-[8px] pr-[12px] text-typeface_primary text-body-semibold-cap-height ${shouldSpan ? 'w-full' : ''}`}>
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
        {t("status." + status.toLowerCase())}
      </div>
    );
  } else if (
    (userRole === "in" && status === "Pending") ||
    (userRole === "st" && status === "Enrolled")
  ) {
    return (
      <>
        {isOpen && shouldSpan && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[9999]"
            onClick={handleOverlayClick}
          />
        )}
        <div className={`relative ${shouldSpan ? 'w-full' : ''} z-[10000]`} ref={dropdownRef}>
          {isOpen && shouldSpan && (
            <div className="absolute bottom-full left-0 right-0 mb-2">
              <button
                className={`${popupButtonClasses} rounded-t-xl`}
                onClick={() => {
                  handleConfirmPopUp();
                  setIsOpen(false);
                }}
              >
                Confirm attendance
              </button>
              <button
                className={`${popupButtonClasses} rounded-b-xl border-t-0`}
                onClick={() => {
                  handleCantAttend();
                  setIsOpen(false);
                }}
              >
                I can't attend
              </button>
            </div>
          )}
          <Button
            className={`${
              isOpen && shouldSpan
                ? "bg-action_bg_tertiary text-typeface_primary text-body-semibold-cap-height"
                : `${styles.rsvp} rsvp-selector`
            } ${shouldSpan ? 'w-full' : ''} ${rsvpButtonHeight}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            <div className="flex items-center justify-center gap-[10px]">
              RSVP
            </div>
          </Button>
          {isOpen && !shouldSpan && (
            <div
              style={{ minWidth: 155, right: 0 }}
              className="absolute z-[100] mt-[4px] flex flex-col rounded-[10px] bg-white p-[4px] shadow-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full">
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConfirmPopUp();
                    setIsOpen(false);
                  }}
                >
                  <div
                    style={{ textAlign: "center" }}
                    className="w-full whitespace-nowrap text-center"
                  >
                    Confirm attendance
                  </div>
                </MenuItem>
                <div className="px-[6px]">
                  <Divider spacing={4} />
                </div>
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCantAttend();
                    setIsOpen(false);
                  }}
                >
                  <div
                    style={{ textAlign: "center" }}
                    className="w-full whitespace-nowrap text-center"
                  >
                    I can't attend
                  </div>
                </MenuItem>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }
  return null;
}
