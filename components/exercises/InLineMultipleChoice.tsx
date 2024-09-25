import { useEffect, useMemo, useState } from "react";
import Button from "../all/buttons/Button";
import MultipleSelectionButton from "./MultipleSelectionButton";
import PopUpContainer from "../all/popups/PopUpContainer";
import { usePopUp } from "../all/popups/PopUpContext";
import Textbox from "./Textbox";
import { set } from "date-fns";

interface InLineMultipleChoiceProps {
  instruction: string;
  questions: string[];
  options: string[][];
  correct_answer: string[];
}

export default function InLineMultipleChoice({
  instruction,
  questions,
  options,
  correct_answer,
}: InLineMultipleChoiceProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    new Array(questions.length).fill(""),
  );
  //   const [popUpOptions, setPopUpOptions] = useState<string[]>(
  //     new Array(questions.length).fill(""),
  //   );
  const { showPopUp, updatePopUp, hidePopUp } = usePopUp();

  useEffect(() => {
    console.log(selectedOptions);
  }, [selectedOptions]);

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

  //   const isAllCorrect = selectedOptions.join("") === correct_answer.join("");

  //   useEffect(() => {
  //     updatePopUp(
  //       "incorrect-answer-popup",
  //       <PopUpContainer
  //         header="Try again"
  //         primaryButtonText="Continue"
  //         primaryButtonDisabled={!isAllCorrect}
  //         primaryButtonOnClick={() => hidePopUp("incorrect-answer-popup")}
  //         popUpId="incorrect-answer-popup"
  //       >
  //         <IncorrectAnswerContent />
  //       </PopUpContainer>,
  //     );
  //   }, [selectedOptions, isAllCorrect]);

  //   const largestWordWidth = useMemo(() => {
  //     const largestWord = .reduce(
  //       (max, word) => (word.length > max.length ? word : max),
  //       "",
  //     );
  //     if (isMobile)
  //       return `${Math.max(largestWord.length, "Type here".length) * 10 + 16}`;
  //     return `${Math.max(largestWord.length, "Type here".length) * 8 + 20}`;
  //   }, [word_bank]);

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
      <div className="rounded-[14px] bg-surface_bg_tertiary">
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
    );
  };

  const checkAnswer = (clearedAnswers: string[]) => {
    console.log("cleared answers");
    const isCorrect = clearedAnswers.join("") === correct_answer.join(""); // New: checking all answers
    setSelectedOptions(clearedAnswers);
    if (isCorrect) {
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
    console.log(selectedOptions);
    if (selectedOptions.join("") === correct_answer.join("")) {
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
    <div className="flex flex-col">
      {questions.map((question, index) => {
        const parts = question.split("[__]");
        return (
          <div className="flex">
            <p className="px-[8px] py-[11px] text-typeface_primary text-body-semibold-cap-height">
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
            <p className="px-[8px] py-[11px] text-typeface_primary text-body-semibold-cap-height">
              {parts[1]}
            </p>
          </div>
        );
      })}
      <div className="self-end pt-[32px]">
        <Button className="button-primary" onClick={handleSubmit}>
          Submit answer
        </Button>
      </div>
    </div>
  );
}
