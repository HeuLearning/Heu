import React, { useState } from "react";
import IconButton from "../instructor/IconButton";
import Checkbox from "./Checkbox";

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
      className="relative inline-flex h-8 items-center rounded-md border border-surface_border_tertiary bg-surface_bg_highlight"
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
        className={`h-full w-full outline-none text-body-medium ${
          isActive
            ? "text-typeface_tertiary placeholder-typeface_tertiary"
            : "text-typeface_primary placeholder-typeface_secondary"
        }`}
        placeholder="Type here"
        style={{
          paddingRight: answer ? "24px" : "8px",
        }}
      />
      {answer && (
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 transform">
          <IconButton
            className="icon-button flex items-center justify-center"
            onClick={handleReset}
          >
            <Checkbox />
          </IconButton>
        </div>
      )}
    </div>
  );
};

export default FillInTheBlank;
