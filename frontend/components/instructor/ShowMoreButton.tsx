import { useState } from "react";
import Button from "./Button";

export default function ShowMoreButton({
  title,
  subtitle,
  children,
  childrenStyling,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button
        className={`w-full ${
          isOpen
            ? "bg-action_bg_tertiary"
            : "bg-white outline-surface_border_tertiary"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex w-full justify-between text-left">
          <div className="text-typeface_primary text-body-semibold-cap-height">
            {title}
          </div>
          <div className="flex items-center gap-[12.5px]">
            <div
              className={`${
                isOpen ? "text-typeface_primary" : "text-typeface_secondary"
              }  text-body-regular-cap-height`}
            >
              {subtitle}
            </div>
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
              >
                <path
                  d="M1.5 1.5L5 5L8.5 1.5"
                  stroke="var(--surface_bg_darkest)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
        </div>
      </Button>
      {isOpen ? (
        <div className={`flex flex-col ${childrenStyling}`}>{children}</div>
      ) : null}
    </div>
  );
}
