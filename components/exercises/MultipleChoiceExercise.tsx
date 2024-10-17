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
import dictionary from "@/dictionary";
import posthog from 'posthog-js'
import { createClient } from "@/utils/supabase/client";

interface MultipleChoiceExerciseProps {
  instruction: string;
  question: string;
  options: string[];
  correct_answer: string;
  onComplete: () => void;
}

export default function MultipleChoiceExercise({
  instruction,
  question,
  options,
  correct_answer,
  onComplete,
}: MultipleChoiceExerciseProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const { showPopUp, updatePopUp, hidePopUp } = usePopUp();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const t = getGT();
  const supabase = createClient();

  const handleComplete = () => {
    onComplete();
    hidePopUp("correct-answer-popup");
    hidePopUp("incorrect-answer-popup");
  };

  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: 'identified_only',
    });
  }, []);

  const isCorrect = (answer: string) => {
    return answer.toLowerCase().trim() === correct_answer.toLowerCase().trim();
  };

  useEffect(() => {
    console.log(selectedOption);
  }, [selectedOption]);

  if (isMobile) {
    const { setHandleSubmitAnswer } = useButtonBar();

    useEffect(() => {
      const handleClick = () => {
        console.log(selectedOption);
        if (selectedOption && isCorrect(selectedOption)) {
          showPopUp({
            id: "correct-answer-popup",
            content: (
              <div>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => {
                    hidePopUp("correct-answer-popup");
                  }}
                />
                <MobileDetailView
                  buttonBar={true}
                  backgroundColor="bg-surface_bg_highlight"
                  className="bottom-0 z-50 max-h-[216px] px-[16px] pt-[16px]"
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
                    />
                  </div>
                </MobileDetailView>
              </div>
            ),
            container: null, // Ensure this ID exists in your DOM
            style: {
              overlay: "overlay-high",
            },
            height: "auto",
          });
        } else {
          showPopUp({
            id: "incorrect-answer-popup",
            content: (
              <div>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => {
                    hidePopUp("incorrect-answer-popup");
                  }}
                />
                <MobileDetailView
                  buttonBar={true}
                  height={500}
                  backgroundColor="bg-surface_bg_highlight"
                  className="bottom-0 z-50 overflow-y-auto px-[16px] pt-[16px]"
                  headerContent={
                    <div className="flex h-[40px] w-full flex-col justify-center">
                      <h3 className="text-typeface_primary text-h3">
                        {t("class_mode_content.oops")}
                      </h3>
                    </div>
                  }
                >
                  <IncorrectAnswerContent />
                  <div className="-ml-[16px]">
                    <ButtonBar
                      primaryButtonText={t("button_content.continue")}
                      primaryButtonOnClick={handleComplete}
                      primaryButtonDisabled={true}
                    />
                  </div>
                </MobileDetailView>
              </div>
            ),
            container: null, // Ensure this ID exists in your DOM
            style: {
              overlay: "overlay-high",
            },
            height: "auto",
          });
        }
      };

      setHandleSubmitAnswer(() => handleClick);

      return () => setHandleSubmitAnswer(() => () => {});
    }, [setHandleSubmitAnswer, selectedOption]);
  }

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
          <div
            className={`rounded-[14px] bg-surface_bg_tertiary p-[8px] ${isMobile ? "flex flex-col gap-[24px]" : ""}`}
          >
            <Textbox
              size="small"
              placeholder={correct_answer}
              width="100%"
              value={clearedAnswer}
              onChange={(value) => {
                clearedAnswer = value;
                setSelectedOption(value);
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
                  {t("class_mode_content.oops")}
                </h3>
              </div>
            }
          >
            <IncorrectAnswerContent />
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
    } else if (isCorrect(clearedAnswer)) {
      updatePopUp(
        "incorrect-answer-popup",
        <PopUpContainer
          header={t("class_mode_content.try_again")}
          primaryButtonText={t("button_content.continue")}
          primaryButtonOnClick={handleComplete}
          popUpId="incorrect-answer-popup"
        >
          <IncorrectAnswerContent />
        </PopUpContainer>,
      );
    }
  };

  const handleSubmit = async () => {
    console.log(selectedOption);

    const correct = selectedOption && isCorrect(selectedOption);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    posthog.capture('submissions', {
      timestamp: new Date().toISOString(),
      correct,
      question: question,
      selectedOption,
    });


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
        container: null, // Ensure this ID exists in your DOM
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
            primaryButtonText={t("button_content.continue")}
            primaryButtonDisabled={true}
            primaryButtonOnClick={handleComplete}
            popUpId="incorrect-answer-popup"
          >
            <IncorrectAnswerContent />
          </PopUpContainer>
        ),
        container: null, // Ensure this ID exists in your DOM
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
        {options.map((option, index) => (
          <WordBankItem
            key={index}
            id={String(index)}
            onClick={() => setSelectedOption(option)}
          >
            <div className="flex items-center gap-[8px]">
              <RadioButton
                checked={selectedOption === option}
                label=""
                name="MultipleChoice"
              />
              <Badge
                bgColor="var(--surface_bg_secondary)"
                textColor="text-typeface_primary"
              >
                <p className="uppercase">{index + 1}</p>
              </Badge>
              {option}
            </div>
          </WordBankItem>
        ))}
      </div>
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
