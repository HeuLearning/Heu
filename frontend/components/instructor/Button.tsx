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
        isMobile ? "h-[44px]" : "h-[32px] pt-[1.12px]" // supposed to be 11px but cap height on button slightly off...
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
