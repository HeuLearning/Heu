import { format } from "date-fns";
import DateCard from "./DateCard";
import PopUp from "./PopUp";
import { usePopUp } from "./PopUpContext";
import { useSessions } from "./SessionsContext";
import styles from "./MiniClassBlock.module.css";

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
        <PopUp
          header="Class canceled"
          primaryButtonText="Continue"
          primaryButtonOnClick={handleCancelSession}
          popUpId="cancel-class-confirmation-popup"
        >
          <p className="text-typeface_primary text-body-regular">
            This class has been canceled and removed from your schedule.
          </p>
        </PopUp>
      ),
      container: null, // Ensure this ID exists in your DOM
      style: {
        overlay: "bg-surface_bg_darkest bg-opacity-[0.5]",
      },
      height: "auto",
    });
  };

  const handleCancelSession = (sessionId) => {
    window.location.reload();
  };

  console.log(action);

  return (
    <PopUp
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
            month={format(startDate, "MMM")}
            day={format(startDate, "d")}
          />
          <div className={`flex items-center justify-between px-[8px]`}>
            <div className="flex gap-[4px] pl-[4px]">
              <h1 className="text-typeface_primary text-body-semibold">
                {format(startDate, "eeee")}
              </h1>
              <h1 className="text-typeface_secondary text-body-medium">
                {format(startDate, "h:mma") +
                  " - " +
                  format(session.end_time, "h:mma")}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </PopUp>
  );
}
