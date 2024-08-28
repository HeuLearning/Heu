import { useResponsive } from "./ResponsiveContext";

export default function BackButton({
  onClick,
  variation = "button-tertiary",
  className = "",
  direction = "back",
}) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  let size = isMobile ? "44" : "32";

  // direction = "back" | "forward", forward really only used in mobile horizontal date picker
  return (
    <button
      onClick={onClick}
      className={`${variation} ${className} rounded-full`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} {size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx={size}
          cy={size}
          r={Number(size) / 2}
          fill="currentBackgroundColor"
        />
        <g
          transform={`translate(${(Number(size) - 32) / 2}, ${
            (Number(size) - 32) / 2
          })`}
        >
          {direction === "back" ? (
            <path
              d="M17.5 12.25L14 15.75L17.5 19.25"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M14.5 19.25L18 15.75L14.5 12.25"
              stroke="#292929"
              stroke-width="2"
              stroke-linecap="round"
            />
          )}
        </g>
      </svg>
    </button>
  );
}
