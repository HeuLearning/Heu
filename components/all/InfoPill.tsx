import { useResponsive } from "./ResponsiveContext";

interface InfoPillProps {
  icon?: boolean;
  text: string;
}

export default function InfoPill({ icon = false, text }: InfoPillProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return (
    <div className="inline-block rounded-full bg-status_bg_info text-status_fg_info text-body-semibold-cap-height">
      <div
        className={`flex items-center gap-[4px] ${
          isMobile
            ? icon
              ? "h-[32px] pl-[7px] pr-[10px]"
              : "h-[32px] px-[10px]"
            : icon
            ? "h-[24px] pl-[4px] pr-[8px]"
            : "h-[24px] px-[8px]"
        }`}
      >
        {icon ? (
          <div className="py-[4px]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8ZM7.25 12V7H8.75V12H7.25ZM8 6C8.55228 6 9 5.55228 9 5C9 4.44772 8.55228 4 8 4C7.44772 4 7 4.44772 7 5C7 5.55228 7.44772 6 8 6Z"
                fill="var(--status_fg_info)"
              />
            </svg>
          </div>
        ) : null}

        <div>{text}</div>
      </div>
    </div>
  );
}
