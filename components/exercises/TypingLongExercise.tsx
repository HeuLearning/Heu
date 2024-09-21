import React, { useState } from "react";
import AudioPlayer from "./AudioPlayer";
import Textbox from "./Textbox";
interface TypingLongExerciseProps {
  audioSrc?: string;
}
const TypingLongExercise: React.FC<TypingLongExerciseProps> = ({
  audioSrc,
}) => {
  const [answer, setAnswer] = useState("");
  return (
    <div className="flex h-full w-full items-center justify-center bg-white p-[24px]">
      <div className="relative flex items-center gap-[128px]">
        {/* Audio Player */}
        <div className="flex-shrink-0">
          {audioSrc && (
            <AudioPlayer audioSrc={audioSrc} title="Listen to the audio" />
          )}
        </div>
        {/* Textbox Container */}
        <div className="relative">
          <Textbox
            size="big"
            placeholder="Enter text"
            width="400"
            height="200"
            value={answer}
            onChange={setAnswer}
          />
          {/* Supporting Message */}
          <p
            className="absolute text-typeface_secondary text-caption"
            style={{ left: "11px" }}
          >
            Supporting message goes here.
          </p>
        </div>
      </div>
    </div>
  );
};
export default TypingLongExercise;
