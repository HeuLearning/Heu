import React, { useEffect } from "react";
import { useResponsive } from "../all/ResponsiveContext";
import Button from "../all/buttons/Button";
import { useButtonBar } from "../all/mobile/ButtonBarContext";
import { getGT } from "gt-next";
import Markdown from 'react-markdown'
import dictionary from "@/dictionary";
import remarkGfm from "remark-gfm";

interface InstructionProps {
  instruction: string;
  onComplete: () => void;
  canContinue?: boolean;
}

export default function Instruction({ 
  instruction, 
  onComplete,
  canContinue = true
}: InstructionProps) {
  const { isMobile } = useResponsive();
  const t = getGT();

  const handleComplete = () => {
    if (canContinue) {
      onComplete();
    }
  };

  if (isMobile) {
    const { setHandleSubmitAnswer } = useButtonBar();

    useEffect(() => {
      const handleClick = () => {
        if (canContinue) {
          onComplete();
        }
      };

      setHandleSubmitAnswer(() => handleClick);

      return () => setHandleSubmitAnswer(() => () => {});
    }, [setHandleSubmitAnswer, canContinue]);
  }

  return (
    <div>
      <h2 className="text-typeface_primary text-h3">
        <Markdown remarkPlugins={[remarkGfm]}>{instruction}</Markdown>
      </h2>
      {!isMobile && canContinue && (
        <div className="self-end">
          <Button 
            className="button-primary" 
            onClick={handleComplete}
          >
            {t("button_content.continue")}
          </Button>
        </div>
      )}
    </div>
  );
}
