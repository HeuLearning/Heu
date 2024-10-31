import { useEffect, useState } from "react";
import WordBankItem from "./WordBankItem";
import RadioButton from "./RadioButton";
import Button from "../all/buttons/Button";
import { usePopUp } from "../all/popups/PopUpContext";
import PopUpContainer from "../all/popups/PopUpContainer";
import { useResponsive } from "../all/ResponsiveContext";
import Textbox from "./Textbox";
import Badge from "../all/Badge";
import { useButtonBar } from "../all/mobile/ButtonBarContext";
import MobileDetailView from "../all/mobile/MobileDetailView";
import ButtonBar from "../all/mobile/ButtonBar";
import { getGT } from "gt-next";
import posthog from 'posthog-js';
import { createClient } from "@/utils/supabase/client";

interface TextSubmissionWithAnswerProps {
  instruction: string;
  question: string;
  correct_answer: string;
  onComplete: () => void;
}

export default function TextSubmissionWithAnswer({
  instruction,
  question,
  correct_answer,
  onComplete,
}: TextSubmissionWithAnswerProps) {
  const [userAnswer, setUserAnswer] = useState<string>("");
  const { showPopUp, updatePopUp, hidePopUp } = usePopUp();
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

  const handleComplete = () => {
    onComplete();
    hidePopUp("correct-answer-popup");
    hidePopUp("incorrect-answer-popup");
  };

  const isCorrect = (answer: string) => {
    return answer.toLowerCase().trim() === correct_answer.toLowerCase().trim();
  };

  const CorrectAnswerContent = () => {
    return (
      <p className="text-typeface_primary text-body-regular">
        {t("class_mode_content.correct_answer_message")}
      </p>
    );
  };

  const IncorrectAnswerContent = () => {
    let clearedAnswer = "";
    return (
      <div className="space-y-[32px]">
        <p className="text-typeface_primary text-body-regular">
          {t("class_mode_content.incorrect_answer_message")}
        </p>
        <div className="space-y-[16px]">
          <p className="text-typeface_primary text-body-medium">
            {t("class_mode_content.please_type_answers")}
          </p>
          <div className={`rounded-[14px] bg-surface_bg_tertiary p-[8px] ${isMobile ? "flex flex-col gap-[24px]" : ""}`}>
            <Textbox
              size="small"
              placeholder={correct_answer}
              width="100%"
              value={clearedAnswer}
              onChange={(value) => {
                clearedAnswer = value;
                setUserAnswer(value);
                checkAnswers(clearedAnswer);
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const checkAnswers = (clearedAnswer: string) => {
    if (isCorrect(clearedAnswer) && isMobile) {
      updatePopUp(
        "incorrect-answer-popup",
        <div>
          <MobileDetailView
            buttonBar={true}
            backgroundColor="bg-surface_bg_highlight"
            className="bottom-0 z-50 max-h-[570px] overflow-y-auto px-[16px] pb-[32px] pt-[16px]"
            headerContent={
              <div className="flex h-[40px] w-full flex-col justify-center">
                <h3 className="text-typeface_primary text-h3">
                  {t("class_mode_content.well_done")}
                </h3>
              </div>
            }
          >
            <CorrectAnswerContent />
            <ButtonBar
              primaryButtonText={t("button_content.continue")}
              primaryButtonOnClick={handleComplete}
              primaryButtonDisabled={false}
            />
          </MobileDetailView>
        </div>,
      );
    }
  };

  if (isMobile) {
    useEffect(() => {
      setHandleSubmitAnswer(() => handleSubmit);
    }, [userAnswer]);
  }

  const handleSubmit = async () => {
    const correct = isCorrect(userAnswer);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    posthog.capture('submissions', {
      timestamp: new Date().toISOString(),
      correct,
      question: question,
      userAnswer,
    });

    if (!correct) {
      showPopUp({
        id: "incorrect-answer-popup",
        content: (
          <PopUpContainer
            header={t("class_mode_content.try_again")}
            primaryButtonText={t("button_content.continue")}
            primaryButtonDisabled={true}
            primaryButtonOnClick={handleComplete}
            popUpId="incorrect-answer-popup"
            closeButton={false}
          >
            <IncorrectAnswerContent />
          </PopUpContainer>
        ),
        container: null,
        style: {
          overlay: "overlay-high",
        },
        height: "auto",
      });
    } else {
      showPopUp({
        id: "correct-answer-popup",
        content: (
          <PopUpContainer
            header={t("class_mode_content.well_done")}
            primaryButtonText={t("button_content.continue")}
            primaryButtonOnClick={handleComplete}
            popUpId="correct-answer-popup"
          >
            <CorrectAnswerContent />
          </PopUpContainer>
        ),
        container: null,
        style: {
          overlay: "overlay-high",
        },
        height: "auto",
      });
    }
  };

  return (
    <div className="flex flex-col gap-[32px]">
      <p className="text-typeface_primary text-body-regular">{instruction}</p>
      <p className="text-typface_primary text-h3">{question}</p>
      <div className="flex flex-col gap-[16px]">
        <Textbox
          size="small"
          placeholder={t("placeholder.type_your_answer")}
          width="100%"
          value={userAnswer}
          onChange={(value) => setUserAnswer(value)}
        />
      </div>
      {!isMobile && (
        <div className="self-end">
          <Button 
            className="button-primary" 
            onClick={handleSubmit}
            disabled={!userAnswer}
          >
            {t("button_content.submit_answer")}
          </Button>
        </div>
      )}
    </div>
  );
} 