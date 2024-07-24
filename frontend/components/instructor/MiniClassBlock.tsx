import Button from "./Button";
import DateCard from "./DateCard";
import PopUp from "./PopUp";
import { useState } from "react";
import { usePopUp } from "./PopUpContext";
import { useRouter } from "next/router";

export default function MiniClassBlock({
  dateCard = false,
  date,
  startTime,
  endTime,
  status,
}) {
  const router = useRouter();
  // date = ["Thursday", "June", "20"];
  let color = "";
  let fillColor = "";
  let backgroundColor = "";
  if (status === "Confirmed") {
    backgroundColor = "bg-surface_bg_tertiary";
    color = "text-status_fg_positive";
    fillColor = "var(--status_fg_positive)";
  } else if (status === "Pending") {
    backgroundColor = "bg-surface_bg_tertiary";
    color = "text-typeface_primary";
    fillColor = "#292929";
  } else if (status === "Online") {
    backgroundColor = "bg-surface_bg_tertiary";
    color = "text-status_fg_positive";
    fillColor = "var(--status_fg_positive)";
  } else if (status === "Canceled") {
    backgroundColor = "bg-surface_bg_tertiary";
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
            <h3 className="text-h3">Confirm attendance</h3>
            <p className="text-body-regular">
              Would you like to confirm attendance to the following class?
            </p>
          </div>
          <div className="py-[32px]">
            <div
              className={`${backgroundColor} flex items-center justify-between rounded-[14px] p-[4px]`}
            >
              <div className="flex items-center">
                <DateCard month={date[1].substring(0, 3)} day={date[2]} />
                <div className={`flex items-center justify-between px-[8px]`}>
                  <div className="">
                    <h1 className="text-typeface_primary text-body-medium">
                      {date[0]}
                    </h1>
                    <div className="flex items-center gap-[7px]">
                      <h2 className="text-typeface_secondary text-body-medium">
                        {startTime + " - " + endTime}
                      </h2>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-[12px]">
            <Button
              className="bg-white text-typeface_primary outline-action_border_primary text-body-semibold-cap-height"
              onClick={() => hidePopUp("confirm-attendance")}
            >
              Cancel
            </Button>
            <Button className="bg-action_bg_primary text-typeface_highlight text-body-semibold-cap-height">
              Confirm
            </Button>
          </div>
        </PopUp>
      ),
      container: null, // Ensure this ID exists in your DOM
      style: {
        overlay: "bg-surface_bg_dark bg-opacity-[0.5]",
      },
      height: "276px",
    });
  };

  const handleEnter = () => {
    router.push("/instructor/test-class-mode");
  };

  return (
    <div>
      {dateCard ? (
        <div
          className={`${backgroundColor} flex items-center justify-between rounded-[14px] pr-[8px]`}
        >
          <div className="flex items-center">
            <DateCard month={date[1].substring(0, 3)} day={date[2]} />
            <div className={`flex items-center justify-between px-[8px]`}>
              <div className="space-y-[3px] py-[14.5px]">
                <h1 className="text-typeface_primary text-body-medium">
                  {date[0]}
                </h1>
                <div className="flex items-center gap-[7px]">
                  <h2 className="text-typeface_secondary text-body-medium">
                    {startTime}
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
            </div>
          </div>
          {status === "Pending" ? (
            <div className="drop-shadow-md">
              <Button
                className="bg-white text-typeface_primary text-body-semibold-cap-height"
                onClick={handleConfirm}
              >
                Confirm
              </Button>
            </div>
          ) : null}
          {status === "Online" ? (
            <div className="drop-shadow-md">
              <Button
                className="bg-white text-typeface_primary text-body-semibold-cap-height"
                onClick={handleEnter}
              >
                Enter
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <div
          className={`flex ${backgroundColor} items-center justify-between px-[8px]`}
        >
          <div className="space-y-[3px] py-[14.5px]">
            <h1 className="text-typeface_primary text-body-medium">
              {date[0] + ", " + date[1] + " " + date[2]}
            </h1>
            <div className="flex items-center gap-[7px]">
              <h2 className="text-typeface_secondary text-body-medium">
                {startTime}
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
          {status === "Pending" ? (
            <div className="drop-shadow-md">
              <Button
                className="bg-white text-typeface_primary text-body-semibold-cap-height"
                onClick={handleConfirm}
              >
                Confirm
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
