import { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from "react";
import Button from "../all/buttons/Button";
import { usePopUp } from "../all/popups/PopUpContext";
import { useResponsive } from "../all/ResponsiveContext";
import Textbox from "./Textbox";
import { getGT } from "gt-next";
import posthog from 'posthog-js';
import { createClient } from "@/utils/supabase/client";
import PopUpContainer from "../all/popups/PopUpContainer";
import MobileDetailView from "../all/mobile/MobileDetailView";
import ButtonBar from "../all/mobile/ButtonBar";

interface TextSubmissionExerciseProps {
  instruction: string;
  question: string;
  size: "small" | "big";
  correctAnswer: string;
  onComplete: () => void;
  userAnswers: string[];
  setUserAnswers: React.Dispatch<React.SetStateAction<string[]>>;
}



export interface TextSubmissionExerciseRef {
  handleSubmit: () => void;
}

const TextSubmissionExercise = forwardRef<TextSubmissionExerciseRef, TextSubmissionExerciseProps>(({
  instruction,
  question,
  size = "big",
  correctAnswer,
  onComplete,
  userAnswers,
  setUserAnswers,
}, ref) => {


  const { showPopUp, hidePopUp, updatePopUp } = usePopUp();

  const t = getGT();

  const removeAccents = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  useEffect(() => {
    if (userAnswers.length === 0) {
      setUserAnswers([""]);
    }
  }, [userAnswers.length]);

  const handleComplete = () => {
    onComplete();
    hidePopUp("correct-answer-popup");
    hidePopUp("incorrect-answer-popup");
  };

  const isCorrect = (userAnswers: string[]): boolean => {
    if (!userAnswers[0] || !correctAnswer) return false;
    const formattedAnswer = removeAccents(userAnswers[0].toLowerCase().trim());
    const formattedCorrectAnswer = removeAccents(correctAnswer.toLowerCase().trim());
    return formattedAnswer === formattedCorrectAnswer;
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
          <div className={`rounded-[14px] bg-surface_bg_tertiary p-[8px] flex flex-col gap-[24px]`}>
            <Textbox
              size="small"
              placeholder={correctAnswer}
              width="100%"
              value={clearedAnswer}
              onChange={(value) => {
                setUserAnswers([value]);
                checkAnswers(value);
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const checkAnswers = (value: string) => {
    if (!isCorrect([value])) {
      updatePopUp(
        "incorrect-answer-popup",
        <div>
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              hidePopUp("incorrect-answer-popup");
            }}
          />
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
            <div className="-ml-[16px]">
              <ButtonBar
                primaryButtonText={t("button_content.continue")}
                primaryButtonOnClick={handleComplete}
                primaryButtonDisabled={false}
              />
            </div>
          </MobileDetailView>
        </div>,
      );
    }
  };

  const handleSubmit = () => {
    const correct = isCorrect(userAnswers);

    if (correct) {
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
    } else {
      showPopUp({
        id: "incorrect-answer-popup",
        content: (
          <PopUpContainer
            header={t("class_mode_content.try_again")}
            primaryButtonText={""}
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
    }
  };

  useImperativeHandle(ref, () => ({
    handleSubmit: () => {
      handleSubmit();
    }
  }), [handleSubmit]);


  return (
    <div className="flex flex-col gap-[32px]">
      <p className="text-typeface_primary text-body-regular">{instruction}</p>
      <p className="text-typface_primary text-h3">{question}</p>
      <div className="flex flex-col gap-2">
        <Textbox
          size={size}
          placeholder={t("class_mode_content.enter_text_here")}
          width="100%"
          value={userAnswers[0]}
          onChange={(value) => {
            setUserAnswers([value]);
          }}
        />
      </div>
    </div>
  );
});

export default TextSubmissionExercise;