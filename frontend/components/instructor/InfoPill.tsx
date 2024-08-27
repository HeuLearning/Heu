import React from "react";

interface InfoPillProps {
  icon?: boolean;
  text: string;
}

const InfoPill: React.FC<InfoPillProps> = ({ icon = false, text }) => {
  return (
    <div className="inline-flex h-[32px] items-center rounded-[10px] bg-surface_bg_highlight px-1">
      <div className="inline-flex h-6 items-center rounded-full bg-status_bg_info text-status_fg_info text-body-semibold-cap-height">
        <div
          className={`flex h-full items-center gap-[4px] ${
            icon ? "pl-[4px] pr-[8px]" : "px-[8px]"
          }`}
        >
          {icon && (
            <div className="flex h-full items-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8ZM7.25 12V7H8.75V12H7.25ZM8 6C8.55228 6 9 5.55228 9 5C9 4.44772 8.55228 4 8 4C7.44772 4 7 4.44772 7 5C7 5.55228 7.44772 6 8 6Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          )}
          <div className="flex h-full items-center">{text}</div>
        </div>
      </div>
    </div>
  );
};

export default InfoPill;
