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
}

export default function RSVPSelector({ session }: RSVPSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownWidth, setDropdownWidth] = useState(0);
  const { confirmSession, getSessionStatus } = useSessions();
  const { userRole } = useUserRole();

  const t = getGT();

  const status = getSessionStatus(session);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const shownButtonRef = useRef<HTMLDivElement>(null);

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

  const { showPopUp, hidePopUp } = usePopUp();

  const handleConfirmPopUp = () => {
    setIsOpen(false);
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

  const handleCantAttend = () => {
    setIsOpen(false);
    showPopUp({
      id: "cant-attend",
      content: (
        <AttendancePopUp
          session={session}
          action="can't attend"
          popUpId="cant-attend"
        />
      ),
      container: null, // Ensure this ID exists in your DOM
      style: {
        overlay: "overlay-high",
      },
      height: "276px",
    });
  };

  console.log("status" + status);

  if (status === "Confirmed" || status === "Canceled") {
    return (
      <div className="flex items-center rounded-[10px] bg-action_bg_tertiary py-[8px] pl-[8px] pr-[12px] text-typeface_primary text-body-semibold-cap-height">
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
      <div className="flex items-center gap-[4px] rounded-[10px] bg-action_bg_tertiary py-[8px] pl-[8px] pr-[12px] text-typeface_primary text-body-semibold-cap-height">
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
  )
    return (
      <div className="relative flex flex-col" ref={dropdownRef}>
        <div className={`shown-button`} ref={shownButtonRef}>
          <Button
            className={
              isOpen
                ? "bg-action_bg_tertiary text-typeface_primary text-body-semibold-cap-height"
                : `${styles.rsvp} rsvp-selector`
            }
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-[10px]">
              RSVP
              {isOpen ? (
                <svg
                  width="10"
                  height="7"
                  viewBox="0 0 10 7"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.5 5.5L5 2L1.5 5.5"
                    stroke="var(--surface_bg_darkest)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg
                  width="10"
                  height="7"
                  viewBox="0 0 10 7"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.rsvp_arrow}
                >
                  <path
                    d="M1.5 1.5L5 5L8.5 1.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>
          </Button>
        </div>
        <div className="drop-down">
          {isOpen && (
            <div
              style={{ minWidth: 155, right: 0 }}
              className="absolute z-[100] mt-[4px] flex flex-col rounded-[10px] bg-white p-[4px] shadow-150"
            >
              <div className="w-full">
                <MenuItem onClick={handleConfirmPopUp}>
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
                <MenuItem onClick={handleCantAttend}>
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
      </div>
    );
}
