import React, { useState } from "react";
import Checkbox from "./Checkbox";

interface FillInTheBlankProps {
  id: string;
  speaker: string;
  text: string;
  answer: string;
  correctAnswer: string;
  onAnswerChange: (answer: string) => void;
}

const FillInTheBlank: React.FC<FillInTheBlankProps> = ({
  id,
  speaker,
  text,
  answer,
  correctAnswer,
  onAnswerChange,
}) => {
  const parts = text.split("[blank]");
  const [isActive, setIsActive] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAnswerChange(e.target.value);
  };

  const handleReset = () => {
    onAnswerChange("");
  };

  const containerWidth =
    Math.max(correctAnswer.length, "Type here".length) * 10 + 20;

  const inputContent = (
    <div
      className="relative inline-block flex h-[32px] items-center rounded-md border border-[#EDEDED] bg-white"
      style={{
        width: containerWidth,
        padding: "0px 10px 0px 12px",
      }}
    >
      <input
        type="text"
        value={answer}
        onChange={handleInputChange}
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        className={`h-full w-full font-medium outline-none text-sm ${
          isActive
            ? "text-[#BFBFBF] placeholder-[#BFBFBF]"
            : "text-[#292929] placeholder-[#999999]"
        }`}
        placeholder="Type here"
        style={{
          paddingRight: "8px",
        }}
      />
      {answer && (
        <Checkbox
          onClick={handleReset}
          className="absolute right-[10px] top-1/2 -translate-y-1/2 transform"
        />
      )}
    </div>
  );

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
          {inputContent}
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

export default FillInTheBlank;
