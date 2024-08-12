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
        isMobile ? "py-[17px]" : "pb-[10.6px] pt-[11.4px]" // supposed to be 11px but cap height on button slightly off...
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
