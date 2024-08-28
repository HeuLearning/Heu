import { useResponsive } from "./ResponsiveContext";

export default function InfoCard({ className = "", onClick = null, children }) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  return (
    <div
      className={`flex flex-col rounded-[10px] bg-white ${
        isMobile ? "px-[16px] py-[24px]" : "p-[24px]"
      } outline-surface_border_tertiary ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
