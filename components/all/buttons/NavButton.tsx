import Button from "./Button";
import { useResponsive } from "../ResponsiveContext";

interface NavButtonProps {
  buttonText: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  selected: boolean;
  disabled?: boolean;
}

export default function NavButton({
  buttonText,
  onClick = () => {},
  selected,
  disabled = false,
}: NavButtonProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return (
    <Button
      key={buttonText}
      className={selected ? "navbutton-selected shadow-25" : "navbutton"}
      justifyContent={isMobile ? "justify-left" : ""}
      onClick={onClick}
      disabled={disabled}
    >
      {buttonText}
    </Button>
  );
}
