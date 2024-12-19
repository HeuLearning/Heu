import { useResponsive } from "../ResponsiveContext";

interface ButtonProps {
  justifyContent?: string;
  className: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export default function Button({
  justifyContent = "justify-center",
  className,
  onClick = () => { },
  children,
  disabled = false,
}: ButtonProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  return (
    <button
      className={`relative inline-flex ${justifyContent} items-center rounded-[10px] px-[12px] ${disabled ? "button-disabled" : className
        } ${disabled
          ? className
            .replace(/\bbutton-primary\b/, "")
            .replace(/\bbutton-secondary\b/, "")
          : ""
        } ${isMobile ? "h-[44px]" : "h-[32px] pt-[1.12px]" // supposed to be 11px but cap height on button slightly off...
        }`}
      onClick={disabled ? () => { } : onClick}
    >
      {children}
    </button>
  );
}
