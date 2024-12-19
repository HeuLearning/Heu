import React, { useState, useMemo, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import Textbox from "./Textbox";
import Badge from "../all/Badge";
import WordBankItem from "./WordBankItem";
import { usePopUp } from "../all/popups/PopUpContext";
import PopUpContainer from "../all/popups/PopUpContainer";
import MobileDetailView from "../all/mobile/MobileDetailView";
import { getGT } from "gt-next";

interface QAFillInBlankExerciseProps {
  instruction: string;
  questions: string[];
  word_bank: string[];
  correct_answer: string[];
  onComplete: () => void;
  setUserAnswers: React.Dispatch<React.SetStateAction<string[]>>;
  userAnswers: string[];
}

export interface QAFillInBlankExerciseRef {
  handleSubmit: () => void;
}

const QAFillInBlankExercise = forwardRef<QAFillInBlankExerciseRef, QAFillInBlankExerciseProps>(({ instruction, questions, word_bank, correct_answer, onComplete, setUserAnswers, userAnswers }, ref) => {

  const t = getGT();

  useEffect(() => {
    if (questions.length > 0 && userAnswers.length === 0) {
      setUserAnswers(new Array(questions.length).fill(''));
    }
  }, [questions, userAnswers.length]);



  const handleComplete = () => {
    onComplete();
    hidePopUp("correct-answer-popup");
    hidePopUp("incorrect-answer-popup");
  };

  const removeAccents = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const isCorrect = (answers: string[]) => {
    return answers.every((answer, index) => {
      const formattedAnswer = removeAccents(answer.toLowerCase().trim());
      const formattedCorrectAnswer = removeAccents(correct_answer[index].toLowerCase().trim());
      return formattedAnswer === formattedCorrectAnswer;
    });
  };

  const { showPopUp, hidePopUp } = usePopUp();

  const handleAnswerChange = (index: number, answer: string) => {
    setUserAnswers((prevAnswers: string[]) => {
      const newAnswers = [...prevAnswers];
      newAnswers[index] = answer;
      return newAnswers;
    });
  };

  const CorrectAnswerContent = () => {
    return (
      <p className="text-typeface_primary text-body-regular">
        {t("class_mode_content.correct_answer_message")}
      </p>
    );
  };

  const IncorrectAnswerContent = () => {
    let wrongAnswers: number[] = [];
    let clearedAnswers = [...userAnswers];

    userAnswers.forEach((answer, index) => {
      if (answer !== correct_answer[index]) {
        wrongAnswers.push(index);
        clearedAnswers[index] = "";
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
          <div className="rounded-[14px] bg-surface_bg_tertiary py-[16px] flex flex-col gap-[24px]">
            {wrongAnswers.map((index) => {
              const question = questions[index];
              const parts = question.split("[__]");
              return (
                <div key={question} className="flex flex-col gap-[16px]">
                  <div className="flex items-center">
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
                        <span className="text-typeface_primary text-body-semibold">
                          {parts[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full px-[10px]">
                    <Textbox
                      size="small"
                      placeholder={correct_answer[index]}
                      width="100%"
                      value={clearedAnswers[index]}
                      onChange={(value) => {
                        handleAnswerChange(index, value);
                        clearedAnswers[index] = value;
                        checkAnswers(clearedAnswers);
                      }}
                    />
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


  const checkAnswers = (clearedAnswers: string[]) => {
    if (isCorrect(clearedAnswers)) {
      setUserAnswers(clearedAnswers);
      hidePopUp("incorrect-answer-popup");
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

  const showWordBankPopUp = (index: number) => {
    showPopUp({
      id: "word-bank-popup",
      content: (
        <WordBankOptionsContent
          clickedIndex={index}
        />
      ),
      container: null,
      style: {
        overlay: "overlay-medium",
      },
      height: "auto",
    });
  };

  const WordBankOptionsContent = ({
    clickedIndex,
  }: {
    clickedIndex: number;
  }) => {
    return (
      <div>
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            hidePopUp("word-bank-popup");
          }}
        />
        <MobileDetailView
          backgroundColor="bg-surface_bg_highlight"
          className="bottom-0 z-50 overflow-y-auto px-[16px] pt-[16px]"
          height={380} // TODO: make this dynamic 
          headerContent={
            <div className="flex h-[40px] w-full flex-col items-center justify-center">
              <h3 className="text-typeface_primary text-body-medium">
                {t("class_mode_content.pick_a_word")}
              </h3>
            </div>
          }
        >
          <div className="flex flex-col gap-[8px] rounded-[14px] bg-surface_bg_tertiary p-[8px]">
            {word_bank.map((word, index) => (
              <WordBankItem
                key={index}
                id={String(index)}
                onClick={() => handleSelectWord(clickedIndex, word)}
              >
                {word}
              </WordBankItem>
            ))}
          </div>
        </MobileDetailView>
      </div>
    );
  };

  const handleSelectWord = (index: number, word: string) => {
    handleAnswerChange(index, word);
    hidePopUp("word-bank-popup");
  };

  useImperativeHandle(ref, () => ({
    handleSubmit: () => {
      handleSubmit();
    }
  }), [handleSubmit]);

  return (
    <>
      <div className="flex flex-col gap-[32px]">
        <p className="text-typeface_primary text-body-regular">
          {instruction}
        </p>
        {questions.map((question, index) => {
          const parts = question.split("[__]");
          return (
            <div className="flex flex-col rounded-[14px] bg-surface_bg_tertiary p-[4px]">
              <div key={index} className="flex flex-col gap-[16px]">
                <div className="flex items-center gap-[8px] px-[4px] mt-[10px]">
                  <Badge
                    bgColor="var(--surface_bg_secondary)"
                    textColor="text-typeface_primary"
                  >
                    {index + 1}
                  </Badge>
                  <div className="flex items-center">
                    {parts[0] && (
                      <span className="text-typeface_primary text-body-semibold">
                        {parts[0]}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full">
                  {userAnswers[index] === "" ? (
                    <div
                      className="border-1px min-h-[44px] w-full cursor-pointer rounded-[10px] bg-surface_bg_highlight outline-dashed-surface_border_primary px-[16px] flex items-center"
                      onClick={() => showWordBankPopUp(index)}
                    >
                      <span className="text-typeface_tertiary">
                        {t("class_mode_content.tap_to_select")}
                      </span>
                    </div>
                  ) : (
                    <WordBankItem
                      id={String(index)}
                      x={true}
                      xButtonOnClick={() => handleAnswerChange(index, "")}
                      onClick={() => showWordBankPopUp(index)}
                    >
                      {userAnswers[index]}
                    </WordBankItem>
                  )}
                  {parts[1] && (
                    <span className="text-typeface_primary text-body-semibold">
                      {parts[1]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
});

export default QAFillInBlankExercise;
