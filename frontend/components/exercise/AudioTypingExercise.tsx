import React, { useState } from "react";
import AudioPlayer from "./AudioPlayer";
import Textbox from "./Input";

interface AudioWritingExerciseProps {
  audioSrc: string;
}

const AudioWritingExercise: React.FC<AudioWritingExerciseProps> = ({
  audioSrc,
}) => {
  const [answer, setAnswer] = useState("");

  return (
    <div className="flex h-full w-full items-center justify-center bg-white p-6">
      <div className="relative flex items-center gap-[128px]">
        {/* Audio Player */}
        <div className="flex-shrink-0">
          <AudioPlayer audioSrc={audioSrc} title="Listen to the audio" />
        </div>

        {/* Textbox Container */}
        <div className="relative">
          <Textbox
            size="big"
            placeholder="Enter text"
            width="400px"
            height="200px"
            value={answer}
            onChange={setAnswer}
          />

          {/* Supporting Message */}
          <p
            className="absolute text-[#999999] text-typeface_secondary text-[12px] leading-[14.52px]"
            style={{ top: "calc(100% + 6px)", left: "11px" }}
          >
            Supporting message goes here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AudioWritingExercise;
