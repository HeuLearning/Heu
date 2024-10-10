import React, { useEffect } from "react";
import { useResponsive } from "../all/ResponsiveContext";
import Button from "../all/buttons/Button";
import { useButtonBar } from "../all/mobile/ButtonBarContext";
import { getGT } from "gt-next";
import Markdown from 'react-markdown'
import dictionary from "@/dictionary";

interface InstructionProps {
  instruction: string;
  onComplete: () => void;
}

export default function Instruction({ instruction, onComplete }: InstructionProps) {
  const { isMobile } = useResponsive();
  const t = getGT();

  const handleComplete = () => {
    onComplete();
  };

  // Log the original instruction received
  console.log("Original Instruction:", instruction);


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
      <h2 className="text-typeface_primary text-h3">
        <Markdown>{instruction}</Markdown>
      </h2>
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
