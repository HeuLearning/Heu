import React, { useEffect } from "react";
import { useResponsive } from "../all/ResponsiveContext";
import Button from "../all/buttons/Button";
import { useButtonBar } from "../all/mobile/ButtonBarContext";
import { getGT } from "gt-next";
import dictionary from "@/dictionary";

interface InstructionProps {
  instruction: string;
  onComplete: () => void; // Define the onComplete prop
}

export default function Instruction({
  instruction,
  onComplete,
}: InstructionProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const t = getGT();

  const handleComplete = () => {
    // Call the onComplete function passed as a prop
    onComplete();
  };

  if (isMobile) {
    const { setHandleSubmitAnswer } = useButtonBar();

    useEffect(() => {
      const handleClick = () => {
        onComplete();
      };

      setHandleSubmitAnswer(() => handleClick);

      return () => setHandleSubmitAnswer(() => () => {});
    }, [setHandleSubmitAnswer]);
  }

  return (
    <div>
      <h2 className="text-typeface_primary text-h3">{instruction}</h2>
      {!isMobile && (
        <div className="self-end">
          <Button className="button-primary" onClick={handleComplete}>
            {t("button_content.continue")}
          </Button>
        </div>
      )}
    </div>
  );
}
