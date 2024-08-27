import { useResponsive } from "./ResponsiveContext";

export default function CircledLabel({ bgColor, textColor, children }) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const size = isMobile ? "32" : "24";
  return (
    <div
      className={`relative ${
        isMobile ? "h-[32px] w-[32px]" : "h-[24px] w-[24px]"
      }`}
    >
      <svg
        width={size}
        height={size}
        viewBox={"0 0 " + size + " " + size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cy={Number(size) / 2}
          cx={Number(size) / 2}
          r={Number(size) / 2}
          fill={bgColor}
        />
      </svg>
      <p
        className={`${textColor} text-body-semibold-cap-height center-atop-svg`}
      >
        {children}
      </p>
    </div>
  );
}
