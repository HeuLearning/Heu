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

interface MultipleChoiceExerciseProps {
  instruction: string;
  question: string;
  options: string[];
  correct_answer: string;
}

export default function MultipleChoiceExercise({
  instruction,
  question,
  options,
  correct_answer,
}: MultipleChoiceExerciseProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const { showPopUp, updatePopUp, hidePopUp } = usePopUp();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  useEffect(() => {
    console.log(selectedOption);
  }, [selectedOption]);

  if (isMobile) {
    const { setHandleSubmitAnswer } = useButtonBar();

    useEffect(() => {
      const handleClick = () => {
        console.log(selectedOption);
        if (
          selectedOption &&
          selectedOption.toLowerCase() === correct_answer.toLowerCase()
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
                      primaryButtonOnClick={() => {}}
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
                      primaryButtonOnClick={() => {}}
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
        Great job! You got all the answers correct.
      </p>
    );
  };

  const IncorrectAnswerContent = () => {
    let clearedAnswer = "";
    return (
      <div className="space-y-[32px]">
        <p className="text-typeface_primary text-body-regular">
          Oops, it looks like you got something wrong. Keep going!
        </p>
        <div className="space-y-[16px]">
          <p className="text-typeface_primary text-body-medium">
            Please type the answers:
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
    let isCorrect =
      clearedAnswer.toLowerCase() === correct_answer.toLowerCase();
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
                primaryButtonOnClick={() => {}}
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
          primaryButtonOnClick={() => {}}
          popUpId="incorrect-answer-popup"
        >
          <IncorrectAnswerContent />
        </PopUpContainer>,
      );
    }
  };

  const handleSubmit = () => {
    console.log(selectedOption);
    if (
      selectedOption &&
      selectedOption.toLowerCase() === correct_answer.toLowerCase()
    ) {
      showPopUp({
        id: "correct-answer-popup",
        content: (
          <PopUpContainer
            header="Good job!"
            primaryButtonText="Continue"
            primaryButtonOnClick={() => {}}
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
            primaryButtonOnClick={() => {}}
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
            Submit answer
          </Button>
        </div>
      )}
    </div>
  );
}
