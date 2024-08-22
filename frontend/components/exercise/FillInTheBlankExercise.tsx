import React from "react";
import FillInTheBlank from "./FillInTheBlankComponent";

interface FillInTheBlankExerciseProps {
  id: string;
  speaker: string;
  text: string;
  answer: string;
  correctAnswer: string;
  onAnswerChange: (answer: string) => void;
}

const FillInTheBlankExercise: React.FC<FillInTheBlankExerciseProps> = ({
  id,
  speaker,
  text,
  answer,
  correctAnswer,
  onAnswerChange,
}) => {
  const parts = text.split("[blank]");

  return (
    <div
      className={`mb-2 flex items-center ${
        speaker === "Jon" ? "justify-end" : "justify-start"
      } mb-[8px] w-full max-w-[1000px]`}
    >
      <div
        className={`flex items-center rounded-lg ${
          speaker === "Paula" ? "flex-row-reverse" : ""
        }`}
        style={{
          width: "fit-content",
          maxWidth: "100%",
          minHeight: "40px",
          borderRadius:
            speaker === "Paula" ? "20px 14px 14px 4px" : "14px 20px 4px 14px",
          backgroundColor: speaker === "Paula" ? "#E1F1FF" : "#EDEDED",
          padding: "4px 4.5px",
        }}
      >
        <div className="flex min-h-[32px] min-w-0 flex-shrink flex-grow flex-wrap items-center">
          <span className="inline-flex items-center px-[10px] py-[4px] font-semibold text-[#292929] text-sm">
            {parts[0]}
          </span>
          <FillInTheBlank
            answer={answer}
            onAnswerChange={onAnswerChange}
            correctAnswer={correctAnswer}
          />
          <span className="inline-flex items-center px-[10px] py-[4px] font-semibold text-[#292929] text-sm">
            {parts[1]}
          </span>
        </div>
        <div className="flex flex-shrink-0 items-center p-[4px]">
          <div
            className={`flex h-[24px] items-center rounded-full px-[8px] ${
              speaker === "Paula" ? "bg-[#339ED3]" : "bg-[#5B5B5B]"
            }`}
          >
            <span className="font-semibold tracking-tight text-white text-sm leading-[16.94px]">
              {speaker}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FillInTheBlankExercise;
