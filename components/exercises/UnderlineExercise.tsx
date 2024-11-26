import React, { useState } from "react";
import AudioPlayer from "./AudioPlayer";
import Textbox from "./Textbox";
interface UnderlineExerciseProps {
  audioSrc: string;
}
const UnderlineExercise: React.FC<UnderlineExerciseProps> = ({ audioSrc }) => {
  const [answer, setAnswer] = useState("");
  return (
    <div className="flex h-full w-full items-center justify-center bg-white p-6">
      <div className="relative flex items-center gap-[128px]">
        {/* Audio Player */}
        <div className="flex-shrink-0">
          <AudioPlayer audioSrc={audioSrc} title="Listen to the audio" />
        </div>
        {/* Textbox Container */}
        <div className="relative" style={{ width: "400px" }}>
          <style>
            {`
              textarea::selection {
                background-color: #F4E5FD;
              }
            `}
          </style>
          <Textbox
            size="big"
            placeholder="Enter text"
            width="400px"
            height="208px"
            value={answer}
            onChange={setAnswer}
          />
          {/* Supporting Message */}
          <p
            className="absolute text-[#999999] text-typeface_secondary text-[12px] leading-[14.52px]"
            style={{ top: "calc(100% + 6px)", left: "11px" }}
          >
            Select a portion of the text to highlight it.
          </p>
        </div>
      </div>
    </div>
  );
};
export default UnderlineExercise;
