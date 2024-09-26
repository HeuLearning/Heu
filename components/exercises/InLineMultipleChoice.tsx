import { useEffect, useMemo, useState } from "react";
import Button from "../all/buttons/Button";
import MultipleSelectionButton from "./MultipleSelectionButton";
import PopUpContainer from "../all/popups/PopUpContainer";
import { usePopUp } from "../all/popups/PopUpContext";
import Textbox from "./Textbox";
import { set } from "date-fns";
import { useResponsive } from "../all/ResponsiveContext";
import { useButtonBar } from "../all/mobile/ButtonBarContext";
import ButtonBar from "../all/mobile/ButtonBar";
import MobileDetailView from "../all/mobile/MobileDetailView";

interface InLineMultipleChoiceProps {
  instruction: string;
  questions: string[];
  options: string[][];
  correct_answer: string[];
  onComplete: () => void;
}

export default function InLineMultipleChoice({
  instruction,
  questions,
  options,
  correct_answer,
  onComplete,
}: InLineMultipleChoiceProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    new Array(questions.length).fill(""),
  );
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { showPopUp, updatePopUp, hidePopUp } = usePopUp();

  const handleComplete = () => {
    onComplete();
    hidePopUp("correct-answer-popup");
    hidePopUp("incorrect-answer-popup");
  };

  if (isMobile) {
    const { setHandleSubmitAnswer } = useButtonBar();

    useEffect(() => {
      const handleClick = () => {
        console.log(selectedOptions);
        if (
          selectedOptions.join("").toLowerCase() ===
          correct_answer.join("").toLowerCase()
        ) {
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
                        Well done!
                      </h3>
                    </div>
                  }
                >
                  <CorrectAnswerContent />
                  <div className="-ml-[16px]">
                    <ButtonBar
                      primaryButtonText="Continue"
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
                      <h3 className="text-typeface_primary text-h3">Oops!</h3>
                    </div>
                  }
                >
                  <IncorrectAnswerContent />
                  <div className="-ml-[16px]">
                    <ButtonBar
                      primaryButtonText="Continue"
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
    }, [setHandleSubmitAnswer, selectedOptions]);
  }

  const handleSelect = (index: number, i: number) => {
    setSelectedOptions((prev) => {
      const newArray = [...prev];
      newArray[index] = options[index][i];
      return newArray;
    });
  };

  const CorrectAnswerContent = () => {
    return (
      <p className="text-typeface_primary text-body-regular">
        Great job! You got all the answers correct.
      </p>
    );
  };

  const IncorrectAnswerContent = () => {
    let wrongAnswers: number[] = [];
    let clearedAnswers = [...selectedOptions]; // Create a local copy of answers

    selectedOptions.forEach((answer, index) => {
      if (answer !== correct_answer[index]) {
        wrongAnswers.push(index);
        clearedAnswers[index] = ""; // Clear the answer locally
      }
    });

    console.log("cleared" + clearedAnswers);

    return (
      <div className="space-y-[32px]">
        <p className="text-typeface_primary text-body-regular">
          Oops, it looks like you got something wrong. Keep going!
        </p>
        <div className="space-y-[16px]">
          <p className="text-typeface_primary text-body-medium">
            Please type the answers:
          </p>
          <div className="rounded-[14px] bg-surface_bg_tertiary">
            <p></p>
            {wrongAnswers.map((index) => {
              const question = questions[index];
              const parts = question.split("[__]");
              return (
                <div className="flex" key={index}>
                  <p className="px-[8px] py-[11px] text-typeface_primary text-body-semibold-cap-height">
                    {parts[0]}
                  </p>
                  <div className="flex gap-[4px]">
                    <Textbox
                      size="small"
                      placeholder={correct_answer[index]}
                      width={String(correct_answer[index].length * 10 + 48)}
                      value={clearedAnswers[index]}
                      onChange={(value) => {
                        clearedAnswers[index] = value;
                        checkAnswer(clearedAnswers);
                      }}
                    />
                  </div>
                  <p className="px-[8px] py-[11px] text-typeface_primary text-body-semibold-cap-height">
                    {parts[1]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const checkAnswer = (clearedAnswers: string[]) => {
    console.log("cleared answers");
    const isCorrect =
      clearedAnswers.join("").toLowerCase() ===
      correct_answer.join("").toLowerCase(); // New: checking all answers
    setSelectedOptions(clearedAnswers);
    if (isCorrect && isMobile) {
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
                <h3 className="text-typeface_primary text-h3">Oops!</h3>
              </div>
            }
          >
            <IncorrectAnswerContent />
            <div className="-ml-[16px]">
              <ButtonBar
                primaryButtonText="Continue"
                primaryButtonOnClick={handleComplete}
                primaryButtonDisabled={false}
              />
            </div>
          </MobileDetailView>
        </div>,
      );
    } else if (isCorrect) {
      updatePopUp(
        "incorrect-answer-popup",
        <PopUpContainer
          header="Try again"
          primaryButtonText="Continue"
          primaryButtonOnClick={handleComplete}
          popUpId="incorrect-answer-popup"
        >
          <IncorrectAnswerContent />
        </PopUpContainer>,
      );
    }
  };

  const handleSubmit = () => {
    console.log(selectedOptions);
    if (
      selectedOptions.join("").toLowerCase() ===
      correct_answer.join("").toLowerCase()
    ) {
      showPopUp({
        id: "correct-answer-popup",
        content: (
          <PopUpContainer
            header="Good job!"
            primaryButtonText="Continue"
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
            header="Try again"
            primaryButtonText="Continue"
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
    <div className="flex flex-col gap-[16px]">
      {questions.map((question, index) => {
        const parts = question.split("[__]");
        return (
          <div className={`flex ${isMobile ? "flex-wrap" : ""}`}>
            <p
              className={`flex items-center justify-center px-[8px] py-[11px] text-typeface_primary text-body-semibold-cap-height`}
            >
              {parts[0]}
            </p>
            <div className="flex gap-[4px]">
              {options[index].map((string, i) => {
                return (
                  <MultipleSelectionButton
                    text={string}
                    key={i}
                    isSelected={selectedOptions[index] === string}
                    onClick={() => handleSelect(index, i)}
                  />
                );
              })}
            </div>
            <p className="flex items-center justify-center px-[8px] py-[11px] text-typeface_primary text-body-semibold-cap-height">
              {parts[1]}
            </p>
          </div>
        );
      })}
      {!isMobile && (
        <div className="self-end pt-[32px]">
          <Button className="button-primary" onClick={handleSubmit}>
            Submit answer
          </Button>
        </div>
      )}
    </div>
  );
}
