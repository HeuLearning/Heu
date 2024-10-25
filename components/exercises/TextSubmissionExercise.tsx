import { useState, useEffect } from "react";
import Button from "../all/buttons/Button";
import { usePopUp } from "../all/popups/PopUpContext";
import { useResponsive } from "../all/ResponsiveContext";
import { useButtonBar } from "../all/mobile/ButtonBarContext";
import Textbox from "./Textbox";
import { getGT } from "gt-next";
import posthog from 'posthog-js';
import { createClient } from "@/utils/supabase/client";

interface TextSubmissionExerciseProps {
  instruction: string;
  question: string;
  onComplete: () => void;
}

export default function TextSubmissionExercise({
  instruction,
  question,
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

  const handleSubmit = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    posthog.capture('text_submission', {
      timestamp: new Date().toISOString(),
      question: question,
      answer: answer,
    });

    showPopUp({
      id: "submission-received",
      content: (
        <div className="p-4">
          <h3 className="mb-2 text-lg font-bold">{t("class_mode_content.submission_received")}</h3>
          <p>{t("class_mode_content.thank_you_for_submission")}</p>
          <Button className="mt-4" onClick={() => { hidePopUp("submission-received"); onComplete(); }}>
            {t("button_content.continue")}
          </Button>
        </div>
      ),
      container: null,
      style: { overlay: "overlay-high" },
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
        size="big"
        placeholder={t("class_mode_content.enter_your_answer")}
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
