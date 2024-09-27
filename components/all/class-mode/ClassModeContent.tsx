import React, { useEffect, useState } from "react";
import MatchingExercise from "../../../components/exercises/MatchingExercise";
import QAFillInBlankExercise from "../../../components/exercises/QAFillInTheBlankExercise";
import { useStopwatchState } from "./StopwatchContext";
import { useUserRole } from "../data-retrieval/UserRoleContext";
import { useResponsive } from "../ResponsiveContext";
import Instruction from "@/components/exercises/Instruction";
import InLineMultipleChoice from "@/components/exercises/InLineMultipleChoice";
import MultipleChoiceExercise from "@/components/exercises/MultipleChoiceExercise";
import { useMemo } from "react";
import ButtonBar from "../mobile/ButtonBar";
import { useButtonBar } from "../mobile/ButtonBarContext";
import { getGT } from "gt-next";
import dictionary from "@/dictionary";

interface ClassModeContentProps {
  jsonData: any; // Consider defining a specific type for jsonData if possible
}

function ClassModeContent({ jsonData }: ClassModeContentProps) {
  const state = useStopwatchState();
  const { elapsedTime, elapsedLapTime } = state;

  const t = getGT();

  const { userRole } = useUserRole();
  const { isMobile } = useResponsive();

  const { handleSubmitAnswer } = useButtonBar();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const exercises = jsonData.student_data?.exercises || [];
  const [buttonBarText, setButtonBarText] = useState("");

  useEffect(() => {
    setCurrentExerciseIndex(0);
  }, [jsonData]);

  console.log("render called ok?");
  console.log(currentExerciseIndex);

  // Memoize the content rendering logic to avoid unnecessary re-renders
  const renderContent = useMemo(() => {
    console.log("THIS IS THE JSON DATA");
    console.log(jsonData.student_data?.exercises);

    if (currentExerciseIndex >= exercises.length) {
      return (
        <p className="text-typeface_primary text-body-regular">
          {t("class_mode_content.no_more_exercises")}
        </p>
      );
    }

    const currentExercise = exercises[currentExerciseIndex];

    const handleComplete = () => {
      setCurrentExerciseIndex((prevIndex) =>
        Math.min(prevIndex + 1, exercises.length),
      );
    };

    console.log(currentExercise);
    console.log("CURRENT EXERCISE BEING SERVED");

    switch (currentExercise.question_type) {
      case "instruction":
        setButtonBarText(t("button_content.continue"));
        return (
          <Instruction
            instruction={currentExercise.content.instruction}
            onComplete={handleComplete}
          />
        );
      case "inlinemultiplechoice":
        setButtonBarText(t("button_content.submit_answer"));
        return (
          <InLineMultipleChoice
            {...currentExercise.content}
            onComplete={handleComplete}
          />
        );
      case "multiplechoice":
        setButtonBarText(t("button_content.submit_answer"));
        return (
          <MultipleChoiceExercise
            {...currentExercise.content}
            onComplete={handleComplete}
          />
        );
      case "qa_fill_in_blank":
        setButtonBarText(t("button_content.submit_answer"));
        return (
          <QAFillInBlankExercise
            {...currentExercise.content}
            onComplete={handleComplete}
          />
        );
      case "matching":
        setButtonBarText(t("button_content.submit_answer"));
        return (
          <MatchingExercise
            {...currentExercise.content}
            onComplete={handleComplete}
          />
        );
      default:
        return <div>Unknown exercise type.</div>;
    }
  }, [currentExerciseIndex, jsonData]);

  return (
    <div>
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col">
          <p>elapsed time: {elapsedTime}</p>
          <p>elapsed time in module: {elapsedLapTime}</p>
          {renderContent}
        </div>
      </div>
      {isMobile && (
        <div className="-ml-[16px]">
          {buttonBarText && (
            <ButtonBar
              primaryButtonText={buttonBarText}
              primaryButtonClassName="button-primary"
              primaryButtonOnClick={handleSubmitAnswer}
              secondaryContent={
                <div className="flex items-center gap-[4px] pl-[8px]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14ZM7.25 4V8V8.31066L7.46967 8.53033L9.96967 11.0303L11.0303 9.96967L8.75 7.68934V4H7.25Z"
                      fill="var(--typeface_primary)"
                    />
                  </svg>
                  <p className="whitespace-nowrap text-typeface_primary text-body-semibold">
                    x mins left
                  </p>
                </div>
              }
            />
          )}
        </div>
      )}
    </div>
  );
}

export default React.memo(ClassModeContent);
