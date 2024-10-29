import { useState, useEffect } from "react";
import Button from "../all/buttons/Button";
import { usePopUp } from "../all/popups/PopUpContext";
import { useResponsive } from "../all/ResponsiveContext";
import { useButtonBar } from "../all/mobile/ButtonBarContext";
import Textbox from "./Textbox";
import { getGT } from "gt-next";
import posthog from 'posthog-js';
import { createClient } from "@/utils/supabase/client";
import PopUpContainer from "../all/popups/PopUpContainer";

interface TextSubmissionExerciseProps {
  instruction: string;
  question: string;
  size: "small" | "big";
  onComplete: () => void;
}

export default function TextSubmissionExercise({
  instruction,
  question,
  size = "big",
  onComplete,
}: TextSubmissionExerciseProps) {
  const [answer, setAnswer] = useState("");
  const { showPopUp, hidePopUp } = usePopUp();
  const { isMobile } = useResponsive();
  const { setHandleSubmitAnswer } = useButtonBar();
  const t = getGT();
  const supabase = createClient();

  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: 'identified_only',
    });
  }, []);

  const handleSubmit = () => {
    showPopUp({
      id: "confirm-submission",
      content: (
        <PopUpContainer
          header={t("class_mode_content.confirm_submission")}
          primaryButtonText={t("button_content.submit_answer")}
          secondaryButtonText={t("button_content.cancel")}
          primaryButtonOnClick={() => {
            hidePopUp("confirm-submission");
            onComplete();
          }}
          secondaryButtonOnClick={() => {
            hidePopUp("confirm-submission");
          }}
          popUpId="confirm-submission"
        >
          <p className="text-typeface_primary text-body-regular">
            {t("class_mode_content.confirm_submission_message")}
          </p>
        </PopUpContainer>
      ),
      container: null,
      style: {
        overlay: "overlay-high",
      },
      height: "auto",
    });
  };

  useEffect(() => {
    if (isMobile) {
      setHandleSubmitAnswer(() => handleSubmit);
    }
  }, [isMobile, answer]);

  return (
    <div className="flex flex-col gap-[32px]">
      <p className="text-typeface_primary text-body-regular">{instruction}</p>
      <p className="text-typface_primary text-h3">{question}</p>
      <Textbox
        size={size}
        placeholder={t("class_mode_content.enter_text_here")}
        width="100%"
        value={answer}
        onChange={(value) => setAnswer(value)}
      />
      {!isMobile && (
        <div className="self-end">
          <Button className="button-primary" onClick={handleSubmit}>
            {t("button_content.submit_answer")}
          </Button>
        </div>
      )}
    </div>
  );
}
