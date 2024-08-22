import React, { useState } from "react";
import Checkbox from "./Checkbox";

function FillInTheBlank({
  id,
  speaker,
  text,
  answer,
  correctAnswer,
  onAnswerChange,
}) {
  const parts = text.split("[blank]");
  const [isActive, setIsActive] = useState(false);

  const handleInputChange = (e) => {
    onAnswerChange(e.target.value);
  };

  const handleReset = () => {
    onAnswerChange("");
  };

  // Calculate container width based on correctAnswer and placeholder
  const containerWidth =
    Math.max(correctAnswer.length, "Type here".length) * 10 + 20; // 10px per character + 20px for padding and checkbox

  const inputContent = (
    <div
      className="relative inline-block h-[32px] rounded-md border border-[#EDEDED] bg-[#FFFFFF]"
      style={{
        width: containerWidth,
        padding: "0px 10px 0px 12px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <input
        type="text"
        value={answer}
        onChange={handleInputChange}
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        className={`h-full w-full font-[500] outline-none text-[14px] ${
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
          className="absolute right-[10px] top-[50%] m-0 -translate-y-1/2 transform"
        />
      )}
    </div>
  );

  return (
    <div
      className={`mb-2 flex items-center ${
        speaker === "Jon" ? "justify-end" : "justify-start"
      }`}
      style={{
        width: "100%",
        maxWidth: "1000px",
        marginBottom: "8px",
      }}
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
        {/* Text and Fill in the Blank Container */}
        <div
          className="flex flex-wrap items-center"
          style={{
            minHeight: "32px",
            flexGrow: 1,
            flexShrink: 1,
            minWidth: 0,
          }}
        >
          <span
            className="font-[600] text-[#292929] text-[14px]"
            style={{
              padding: "4px 10px",
              whiteSpace: "normal",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {parts[0]}
          </span>
          {inputContent}
          <span
            className="font-[600] text-[#292929] text-[14px]"
            style={{
              padding: "4px 10px",
              whiteSpace: "normal",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {parts[1]}
          </span>
        </div>

        {/* Speaker Container */}
        <div
          className="flex items-center"
          style={{
            padding: "4px",
            flexShrink: 0,
          }}
        >
          <div
            className="flex items-center rounded-full"
            style={{
              height: "24px",
              padding: "0px 8px",
              backgroundColor: speaker === "Paula" ? "#339ED3" : "#5B5B5B",
            }}
          >
            <span
              className="font-[600] text-[#FFFFFF] text-[14px] leading-[16.94px]"
              style={{ letterSpacing: "-0.02em" }}
            >
              {speaker}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FillInTheBlank;
