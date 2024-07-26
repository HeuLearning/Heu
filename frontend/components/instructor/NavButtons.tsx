import Button from "./Button";
import { useResponsive } from "./ResponsiveContext";
import { useState } from "react";

export default function NavButtons({ buttonOptions, selectedButton }) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [activeNavButton, setActiveNavButton] = useState(selectedButton);

  return (
    <div className={isMobile ? "flex flex-col gap-[24px]" : "flex gap-[12px]"}>
      {buttonOptions.map((buttonText) => (
        <Button
          key={buttonText}
          className={
            buttonText === activeNavButton ? "navbutton-selected" : "navbutton"
          }
          justifyContent={isMobile ? "justify-left" : ""}
          onClick={() => setActiveNavButton(buttonText)}
        >
          {buttonText}
        </Button>
      ))}
    </div>
  );
}
