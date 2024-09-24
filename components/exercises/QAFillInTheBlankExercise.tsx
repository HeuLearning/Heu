import React, { useState, useMemo } from "react";
import Textbox from "./Textbox";
import Badge from "../all/Badge";
import InfoPill from "../all/InfoPill";
import WordBankItem from "./WordBankItem";
import Button from "../all/buttons/Button";
import { usePopUp } from "../all/popups/PopUpContext";
import PopUpContainer from "../all/popups/PopUpContainer";
import { set } from "date-fns";

// interface Question {
//   id: string;
//   text: string;
//   answer: string;
//   correctAnswer: string;
// }

// interface Word {
//   id: string;
//   content: string;
// }

interface QAFillInBlankExerciseProps {
  questions: string[];
  answers: string[];
  word_bank: string[];
  correct_answer: string[];
}

const QAFillInBlankExercise: React.FC<QAFillInBlankExerciseProps> = ({
  questions,
  answers,
  word_bank,
  correct_answer,
}) => {
  const [userAnswers, setUserAnswers] = useState<string[]>([]);

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
    return `${Math.max(largestWord.length, "Type here".length) * 8 + 20}`;
  }, [word_bank]);

  const handleSubmit = () => {
    console.log(userAnswers);
    if (userAnswers.join("") === correct_answer.join("")) {
      showPopUp({
        id: "correct-answer-popup",
        content: (
          <PopUpContainer
            header="Good job!"
            primaryButtonText="Continue"
            primaryButtonOnClick={() => {}}
            popUpId="correct-answer-popup"
          >
            <p className="text-typeface_primary text-body-regular">
              Great job! You got all the answers correct.
            </p>
          </PopUpContainer>
        ),
        container: null, // Ensure this ID exists in your DOM
        style: {
          overlay: "overlay-high",
        },
        height: "auto",
      });
    } else {
      let wrongAnswers: number[] = [];
      let clearedAnswers = [...userAnswers]; // Create a local copy of answers

      userAnswers.forEach((answer, index) => {
        if (answer !== correct_answer[index]) {
          wrongAnswers.push(index);
          clearedAnswers[index] = ""; // Clear the answer locally
        }
      });
      showPopUp({
        id: "incorrect-answer-popup",
        content: (
          <PopUpContainer
            header="Try again"
            primaryButtonText="Continue"
            primaryButtonDisabled={true}
            primaryButtonOnClick={() => {}}
            popUpId="incorrect-answer-popup"
          >
            <div className="space-y-[32px]">
              <p className="text-typeface_primary text-body-regular">
                Oops, it looks like you got something wrong. Keep going!
              </p>
              <div className="space-y-[16px]">
                <p className="text-typeface_primary text-body-medium">
                  Please type the answers:{" "}
                </p>
                <div className="rounded-[14px] bg-surface_bg_tertiary p-[8px]">
                  {wrongAnswers.map((index) => {
                    const question = questions[index];
                    const parts = question.split("[__]");
                    return (
                      <div>
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
                              placeholder="Type here"
                              width={largestWordWidth}
                              value={clearedAnswers[index]}
                              onChange={(value) => {
                                handleAnswerChange(index, value);
                                clearedAnswers[index] = value;
                                checkAnswers(clearedAnswers, wrongAnswers);
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

  const checkAnswers = (clearedAnswers: string[], wrongAnswers: number[]) => {
    const isCorrect = clearedAnswers.join("") === correct_answer.join("");
    if (isCorrect) {
      updatePopUp(
        "incorrect-answer-popup",
        <PopUpContainer
          header="Try again"
          primaryButtonText="Continue"
          primaryButtonOnClick={() => {}}
          popUpId="incorrect-answer-popup"
        >
          <div className="space-y-[32px]">
            <p className="text-typeface_primary text-body-regular">
              Oops, it looks like you got something wrong. Keep going!
            </p>
            <div className="space-y-[16px]">
              <p className="text-typeface_primary text-body-medium">
                Please type the answers:{" "}
              </p>
              <div className="rounded-[14px] bg-surface_bg_tertiary p-[8px]">
                {wrongAnswers.map((index) => {
                  const question = questions[index];
                  const parts = question.split("[__]");
                  return (
                    <div>
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
                            placeholder="Type here"
                            width={largestWordWidth}
                            value={clearedAnswers[index]}
                            onChange={(value) => {
                              handleAnswerChange(index, value);
                              clearedAnswers[index] = value;
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
        </PopUpContainer>,
      );
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex h-full w-full items-center justify-center bg-white p-[24px]">
        <div className="flex items-start gap-[128px]">
          {/* Questions Container */}
          <div className="flex flex-col">
            <h2 className="mb-4 pl-3 text-typeface_primary text-body-regular">
              Questions:
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
              Answers:
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
      <Button className="button-primary self-end" onClick={handleSubmit}>
        Submit answer
      </Button>
    </div>
  );
};

export default QAFillInBlankExercise;
