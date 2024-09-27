import React, { useState, useMemo, useEffect } from "react";
import Textbox from "./Textbox";
import Badge from "../all/Badge";
import InfoPill from "../all/InfoPill";
import WordBankItem from "./WordBankItem";
import Button from "../all/buttons/Button";
import { usePopUp } from "../all/popups/PopUpContext";
import PopUpContainer from "../all/popups/PopUpContainer";
import { useResponsive } from "../all/ResponsiveContext";
import ButtonBar from "../all/mobile/ButtonBar";
import { useButtonBar } from "../all/mobile/ButtonBarContext";
import MobileDetailView from "../all/mobile/MobileDetailView";
import XButton from "../all/buttons/XButton";
import { getGT } from "gt-next";
import dictionary from "@/dictionary";

interface QAFillInBlankExerciseProps {
  instruction: string;
  questions: string[];
  answers: string[];
  word_bank: string[];
  correct_answer: string[];
  onComplete: () => void;
}

const QAFillInBlankExercise: React.FC<QAFillInBlankExerciseProps> = ({
  instruction,
  questions,
  answers,
  word_bank,
  correct_answer,
  onComplete,
}) => {
  const [userAnswers, setUserAnswers] = useState<string[]>(
    new Array(questions.length).fill(""),
  );

  const { isMobile, isTablet, isDesktop } = useResponsive();
  const t = getGT();

  const handleComplete = () => {
    onComplete();
    hidePopUp("correct-answer-popup");
    hidePopUp("incorrect-answer-popup");
  };

  const isCorrect = (answers: string[]) => {
    return (
      answers.join("").toLowerCase().trim() ===
      correct_answer.join("").toLowerCase().trim()
    );
  };

  if (isMobile) {
    const { setHandleSubmitAnswer } = useButtonBar();

    useEffect(() => {
      const handleClick = () => {
        console.log(userAnswers);
        if (isCorrect(userAnswers)) {
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
                  height={570}
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
    }, [setHandleSubmitAnswer, userAnswers]);
  }

  const { showPopUp, updatePopUp, hidePopUp } = usePopUp();

  const handleAnswerChange = (index: number, answer: string) => {
    setUserAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      newAnswers[index] = answer;
      return newAnswers;
    });
  };

  const largestWordWidth = useMemo(() => {
    const largestWord = word_bank.reduce(
      (max, word) => (word.length > max.length ? word : max),
      "",
    );
    if (isMobile)
      return `${Math.max(largestWord.length, "Type here".length) * 10 + 16}`;
    return `${Math.max(largestWord.length, "Type here".length) * 8 + 20}`;
  }, [word_bank]);

  const CorrectAnswerContent = () => {
    return (
      <p className="text-typeface_primary text-body-regular">
        {t("class_mode_content.correct_answer_message")}
      </p>
    );
  };

  const IncorrectAnswerContent = () => {
    let wrongAnswers: number[] = [];
    let clearedAnswers = [...userAnswers]; // Create a local copy of answers

    userAnswers.forEach((answer, index) => {
      if (answer !== correct_answer[index]) {
        wrongAnswers.push(index);
        clearedAnswers[index] = ""; // Clear the answer locally
      }
    });
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
            {wrongAnswers.map((index) => {
              const question = questions[index];
              const parts = question.split("[__]");
              return (
                <div
                  className={`${isMobile ? "flex flex-col gap-[16px]" : ""}`}
                >
                  <div
                    key={question}
                    className="flex h-[32px] w-fit items-center"
                  >
                    <div className="flex items-center px-[10px]">
                      <Badge
                        bgColor="var(--surface_bg_secondary)"
                        textColor="text-typeface_primary"
                      >
                        {index + 1}
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      {parts[0] && (
                        <span className="px-[10px] text-typeface_primary text-body-semibold">
                          {parts[0]}
                        </span>
                      )}
                      <Textbox
                        size="small"
                        placeholder={correct_answer[index]}
                        width={largestWordWidth}
                        value={clearedAnswers[index]}
                        onChange={(value) => {
                          handleAnswerChange(index, value);
                          clearedAnswers[index] = value;
                          checkAnswers(clearedAnswers);
                        }}
                      />
                      {parts[1] && (
                        <span className="px-[10px] text-typeface_primary text-body-semibold">
                          {parts[1]}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex h-[32px] items-center pl-[8px]">
                    <InfoPill text={answers[index]} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const handleSubmit = () => {
    console.log(userAnswers);
    if (isCorrect(userAnswers)) {
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

  const checkAnswers = (clearedAnswers: string[]) => {
    if (isCorrect(clearedAnswers) && isMobile) {
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
    } else if (isCorrect(clearedAnswers)) {
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

  if (isMobile)
    return (
      <>
        <div className="flex flex-col gap-[32px]">
          <p className="text-typeface_primary text-body-regular">
            {instruction}
          </p>
          {questions.map((question, index) => {
            const parts = question.split("[__]");
            return (
              <div className="flex flex-col rounded-[14px] bg-surface_bg_tertiary pt-[4px]">
                <div key={index} className="mb-[16px] flex w-fit items-center">
                  <div className="flex items-center px-[10px]">
                    <Badge
                      bgColor="var(--surface_bg_secondary)"
                      textColor="text-typeface_primary"
                    >
                      {index + 1}
                    </Badge>
                  </div>
                  <div className="flex w-fit flex-wrap items-center">
                    {parts[0] && (
                      <span className="px-[10px] text-typeface_primary text-body-semibold">
                        {parts[0]}
                      </span>
                    )}
                    <Textbox
                      size="small"
                      placeholder="Type here"
                      width={largestWordWidth}
                      value={userAnswers[index]}
                      onChange={(value) => handleAnswerChange(index, value)}
                    />
                    {parts[1] && (
                      <span className="px-[10px] text-typeface_primary text-body-semibold">
                        {parts[1]}
                      </span>
                    )}
                  </div>
                </div>
                <div
                  key={index}
                  className="mb-[16px] flex h-[32px] items-center pl-[4px]"
                >
                  <InfoPill text={answers[index]} />
                </div>
                <div className="flex gap-[4px] rounded-[14px] bg-surface_bg_secondary p-[4px]">
                  {word_bank.map((word, index) => (
                    <div className="w-1/3">
                      <WordBankItem id={String(index)}>{word}</WordBankItem>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );

  return (
    <div className="flex flex-col">
      <p className="pb-[32px] text-typeface_primary text-body-regular">
        {instruction}
      </p>
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex items-start gap-[128px]">
          {/* Questions Container */}
          <div className="flex flex-col">
            <h2 className="mb-4 pl-3 text-typeface_primary text-body-regular">
              {t("class_mode_content.questions")}
            </h2>
            {questions.map((question, index) => {
              const parts = question.split("[__]");
              return (
                <div
                  key={index}
                  className="mb-[16px] flex h-[32px] w-fit items-center"
                >
                  <div className="flex items-center px-[10px]">
                    <Badge
                      bgColor="var(--surface_bg_secondary)"
                      textColor="text-typeface_primary"
                    >
                      {index + 1}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    {parts[0] && (
                      <span className="px-[10px] text-typeface_primary text-body-semibold">
                        {parts[0]}
                      </span>
                    )}
                    <Textbox
                      size="small"
                      placeholder="Type here"
                      width={largestWordWidth}
                      value={userAnswers[index]}
                      onChange={(value) => handleAnswerChange(index, value)}
                    />
                    {parts[1] && (
                      <span className="px-[10px] text-typeface_primary text-body-semibold">
                        {parts[1]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Answers Container */}
          <div className="flex flex-col">
            <h2 className="mb-[16px] pl-[10px] text-typeface_primary text-body-regular">
              {t("class_mode_content.answers")}
            </h2>
            <div className="flex flex-col">
              {answers.map((answer, index) => (
                <div
                  key={index}
                  className="mb-[16px] flex h-[32px] items-center pl-[4px]"
                >
                  <InfoPill text={answer} />
                </div>
              ))}
            </div>
          </div>

          {/* Word Bank Container */}
          <div
            className="self-center rounded-[14px] bg-surface_bg_secondary p-[4px]"
            style={{ display: "inline-block" }}
          >
            <div className="flex flex-col gap-[4px]">
              {word_bank.map((word, index) => (
                <WordBankItem id={String(index)}>{word}</WordBankItem>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="self-end">
        <Button
          className="button-primary"
          onClick={handleSubmit}
          disabled={userAnswers.some((item) => item.trim() === "")}
        >
          {t("button_content.submit_answer")}
        </Button>
      </div>
    </div>
  );
};

export default QAFillInBlankExercise;
