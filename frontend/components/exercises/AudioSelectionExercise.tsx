import React, { useState } from "react";
import AudioPlayer from "./AudioPlayer";
import ButtonText from "./MultipleSelectionButton";

interface AudioSelectionExerciseProps {
  audioTitle: string;
  audioSrc: string;
  options: string[];
  correctAnswers?: string[];
}

const AudioSelectionExercise: React.FC<AudioSelectionExerciseProps> = ({
  audioTitle,
  audioSrc,
  options,
  correctAnswers,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleSelect = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-white p-[24px]">
      <div className="flex items-center gap-[128px]">
        {/* Left Container: Audio Player */}
        <div className="flex-shrink-0">
          <AudioPlayer title={audioTitle} audioSrc={audioSrc} />
        </div>

        {/* Right Container: Word Choices */}
        <div className="max-w-[550px] flex-col">
          {/*  Button wrapping: */}
          <div className="flex flex-wrap items-start justify-start gap-[4px]">
            {options.map((option, index) => (
              <ButtonText
                key={index}
                text={option}
                isSelected={selectedOptions.includes(option)}
                onClick={() => handleSelect(option)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioSelectionExercise;
