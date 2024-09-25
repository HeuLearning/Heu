import React from "react";
import MatchingExercise from "../../../components/exercises/MatchingExercise";
import ConvoFillInTheBlankExercise from "../../exercises/ConvoFillInTheBlankExercise";
import QAFillInBlankExercise from "../../../components/exercises/QAFillInTheBlankExercise";
import MultipleSelectionExercise from "../../exercises/MultipleSelectionExercise";
import WritingTypingExercise from "../../exercises/WritingTypingExercise";
import { useStopwatchState } from "./StopwatchContext";
import TypingLongExercise from "@/components/exercises/TypingLongExercise";
import { useUserRole } from "../data-retrieval/UserRoleContext";
import Button from "../buttons/Button";
import { useResponsive } from "../ResponsiveContext";
import Instruction from "@/components/exercises/Instruction";
import InLineMultipleChoice from "@/components/exercises/InLineMultipleChoice";

interface ClassModeContentProps {
  jsonData: any;
}

function ClassModeContent({ jsonData }: ClassModeContentProps) {
  const state = useStopwatchState();
  const { elapsedTime, elapsedLapTime } = state;

  const { userRole } = useUserRole();
  const { isMobile } = useResponsive();

  const testMatchingExercise = false;
  const testQAFillInTheBlank = false;
  const testInstruction = false;
  const testInLineMultipleChoice = true;

  const renderContent = () => {
    if (testInstruction) {
      const instruction = "Repeat after your instructor.";
      return <Instruction instruction={instruction} />;
    } else if (testInLineMultipleChoice) {
      const multipleChoiceData = {
        instruction: "Pick the right answer.",
        questions: [
          "My name [__] Sarita.",
          "I [__] from Nepal.",
          "His name [__] José.",
          "Her name [__] Maria.",
          "Where are [__] from?",
        ],
        options: [
          ["is", "are"],
          ["am", "are"],
          ["is", "are"],
          ["is", "am"],
          ["you", "your"],
        ],
        correct_answer: ["is", "am", "is", "is", "you"],
      };
      return <InLineMultipleChoice {...multipleChoiceData} />;
    } else if (testQAFillInTheBlank) {
      const qaFillInBlankData = {
        instruction: "Fill in the blanks with the correct words.",
        word_bank: ["when", "day", "month"],
        questions: [
          "[__] is your birthday?",
          "What [__] is it?",
          "What [__] is it?",
          "What [__] is English class?",
          "What [__] is September 9th?",
        ],
        answers: [
          "It's March 13th.",
          "It's Tuesday.",
          "It's June.",
          "It's Monday.",
          "It's Thursday.",
        ],
        correct_answer: ["when", "day", "month", "day", "day"],
      };

      return <QAFillInBlankExercise {...qaFillInBlankData} />;
    } else if (testMatchingExercise) {
      return <MatchingExercise />;
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col">
        <div>{JSON.stringify(jsonData, null, 2)}</div>
        <p>elapsed time: {elapsedTime}</p>
        <p>elapsed time in module: {elapsedLapTime}</p>
        {renderContent()}
      </div>
    </div>
  );
}

export default React.memo(ClassModeContent);
