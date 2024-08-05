import { useResponsive } from "./ResponsiveContext";

export default function Button({
  justifyContent = "justify-center",
  className,
  onClick = null,
  children,
}) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  return (
    <button
      className={`relative inline-flex ${justifyContent} items-center rounded-[10px] px-[12px] ${className} ${
        isMobile ? "py-[17px]" : "py-[11px]"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
