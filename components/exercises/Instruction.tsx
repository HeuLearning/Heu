import { getGT } from "gt-next";
import React, { useEffect } from "react";
import { useResponsive } from "../all/ResponsiveContext";
import Markdown from "react-markdown";
import { Button } from "../ui/button";


interface InstructionContent{
  instruction: string;
}

interface InstructionProps {
  content: InstructionContent;
  onComplete: () => void;
  canContinue?: boolean;
  
}



export default function Instruction({ 
  content, 
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
  return (
    <div>
    
    <p className="text-typeface_primary text-h3">{content.instruction}</p>
    
    { canContinue && (
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
  )




  /*
  
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
  */
}
