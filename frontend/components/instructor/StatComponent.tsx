import { useResponsive } from "./ResponsiveContext";

export default function StatComponent({
  heading,
  subheading,
  bgColor,
  children,
}) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  return (
    <div className="flex gap-[16px]">
      <div
        className={`relative  ${
          isMobile ? "h-[44px] w-[44px]" : "h-[40px] w-[40px]"
        }`}
      >
        <div className="z-10 center-atop-svg">{children}</div>
        <svg
          width={isMobile ? "44" : "40"}
          height={isMobile ? "44" : "40"}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="20"
            cy="20"
            r="20"
            fill={
              isMobile ? `var(--surface_border_tertiary)` : `var(--${bgColor})`
            }
          />
        </svg>
      </div>
      <div className="space-y-[3px]">
        <h2
          className={`text-typeface_primary ${
            isMobile
              ? "h-[22px] font-[600] tracking-[-1%] text-[16px] leading-[22px]"
              : "text-h2"
          }`}
        >
          {heading}
        </h2>
        <h2
          className={`text-typeface_secondary ${
            isMobile
              ? "h-[26px] font-[400] tracking-[-1%] text-[16px] leading-[26px]"
              : "text-body-medium-cap-height"
          }`}
        >
          {subheading}
        </h2>
      </div>
    </div>
  );
}
