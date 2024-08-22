import React, { useState } from "react";

interface FillInTheBlankProps {
  id: string;
  answer: string;
  correctAnswer: string;
  onAnswerChange: (answer: string) => void;
}

const FillInTheBlank: React.FC<FillInTheBlankProps> = ({
  id,
  answer,
  correctAnswer,
  onAnswerChange,
}) => {
  const [isActive, setIsActive] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAnswerChange(e.target.value);
  };

  const handleReset = () => {
    onAnswerChange("");
  };

  const containerWidth =
    Math.max(correctAnswer.length, "Type here".length) * 10 + 20;

  return (
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
        <button
          onClick={handleReset}
          className="absolute right-[10px] top-1/2 -translate-y-1/2 transform"
        >
          &#10005; {/* X icon as a reset button */}
        </button>
      )}
    </div>
  );
};

export default FillInTheBlank;
