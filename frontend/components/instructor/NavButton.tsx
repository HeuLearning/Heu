import Button from "./Button";
import { useResponsive } from "./ResponsiveContext";
import { useState } from "react";

export default function NavButton({
  buttonText,
  onClick = null,
  selected,
  disabled = false,
}) {
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
