import { useResponsive } from "./ResponsiveContext";

export default function BackButton({
  onClick,
  variation = "button-tertiary",
  className = "",
}) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  let size = isMobile ? "44" : "32";
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
          <path
            d="M17.5 12.25L14 15.75L17.5 19.25"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </button>
  );
}
