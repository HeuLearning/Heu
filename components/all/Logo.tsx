import { useResponsive } from "./ResponsiveContext";

export default function Logo() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  return (
    <div
      style={
        isMobile
          ? { width: "44px", height: "44px" }
          : { width: "40px", height: "40px" }
      }
      className={`relative ${
        isMobile ? "h-[44px] w-[44px]" : "h-[40px] w-[40px]"
      }`}
    >
      <svg
        width={isMobile ? "44" : "40"}
        height={isMobile ? "44" : "40"}
        viewBox={isMobile ? "0 0 44 44" : "0 0 40 40"}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx={isMobile ? "22" : "20"}
          cy={isMobile ? "22" : "20"}
          r={isMobile ? "22" : "16"}
          fill="#AD73CE"
        />
      </svg>
      <img
        src="/heu-logo-white.png"
        className={`z-10 ${
          isMobile ? "h-[30px] w-[30px]" : "h-[25px] w-[25px]"
        } center-atop-svg`}
      />
    </div>
  );
}
