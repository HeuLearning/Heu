import { useResponsive } from "./ResponsiveContext";

export default function X({
  onClick,
  variation = "button-tertiary",
  className = "",
}) {
  const { isMobile } = useResponsive();
  let size = isMobile ? "44" : "32";

  return (
    <button
      className={`${variation} ${className} rounded-full`}
      onClick={onClick}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx={Number(size) / 2}
          cy={Number(size) / 2}
          r={Number(size) / 2}
          fill="currentBackgroundColor"
        />
        <g
          transform={`translate(${(Number(size) - 32) / 2}, ${
            (Number(size) - 32) / 2
          })`}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.2071 11.7929C12.8166 11.4024 12.1834 11.4024 11.7929 11.7929C11.4024 12.1834 11.4024 12.8166 11.7929 13.2071L14.5858 16L11.7929 18.7929C11.4024 19.1835 11.4024 19.8166 11.7929 20.2072C12.1834 20.5977 12.8166 20.5977 13.2071 20.2072L16 17.4142L18.7929 20.2071C19.1834 20.5976 19.8166 20.5976 20.2071 20.2071C20.5976 19.8166 20.5976 19.1834 20.2071 18.7929L17.4142 16L20.2071 13.2072C20.5976 12.8166 20.5976 12.1835 20.2071 11.7929C19.8166 11.4024 19.1834 11.4024 18.7929 11.7929L16 14.5858L13.2071 11.7929Z"
            fill="currentColor"
          />
        </g>
      </svg>
    </button>
  );
}
