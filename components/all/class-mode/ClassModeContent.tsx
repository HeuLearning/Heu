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

interface ClassModeContentProps {
  jsonData: any;
}

function ClassModeContent({ jsonData }: ClassModeContentProps) {
  const state = useStopwatchState();
  const { elapsedTime, elapsedLapTime } = state;

  const { userRole } = useUserRole();
  const { isMobile } = useResponsive();

  const testConvoFillInTheBlank = false;
  const testMatchingExercise = false;
  const testQAFillInTheBlank = true;
  const testMultipleSelection = false;
  const testWritingTyping = false;
  const testTypingLong = false;

  const renderContent = () => {
    if (testQAFillInTheBlank) {
      const qaFillInBlankData = {
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
    } else if (testConvoFillInTheBlank) {
      const convoFillInTheBlankData = {
        questions: [
          {
            id: "q1",
            speakerIndex: 0,
            text: "Hi, Jon! How's the [__] today?",
            answer: "",
            correctAnswer: "weather",
          },
          {
            id: "q2",
            speakerIndex: 1,
            text: "It's bad. It's snowy and [__].",
            answer: "",
            correctAnswer: "rainy",
          },
          {
            id: "q3",
            speakerIndex: 0,
            text: "Oh no. What's the [__] today?",
            answer: "",
            correctAnswer: "temperature",
          },
          {
            id: "q4",
            speakerIndex: 1,
            text: "It's about 30 [__]. It's cold in the winter!",
            answer: "",
            correctAnswer: "degrees",
          },
          {
            id: "q5",
            speakerIndex: 0,
            text: "In Haiti, it's [__] sometimes. But it's always hot.",
            answer: "",
            correctAnswer: "windy",
          },
        ],
        words: [
          { id: "word1", content: "temperature" },
          { id: "word2", content: "weather" },
          { id: "word3", content: "degrees" },
          { id: "word4", content: "rainy" },
          { id: "word5", content: "windy" },
        ],
        speakers: ["Paula", "Jon"],
      };

      return <ConvoFillInTheBlankExercise {...convoFillInTheBlankData} />;
    } else if (testMatchingExercise) {
      return <MatchingExercise />;
    }

    if (testMultipleSelection) {
      const selectionData = {
        audioTitle: "Coffee Shop",
        audioSrc:
          "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
        options: ["Hey", "Nice to meet you", "Last name", "Teacher", "Goodbye"],
        correctAnswers: ["Hey", "Nice to meet you"],
      };

      return <MultipleSelectionExercise {...selectionData} />;
    } else if (testWritingTyping) {
      const writingTypingData = {
        audioSrc:
          "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
        questions: [
          {
            id: "1",
            text: "What does Jorge do?",
            answer: "",
            requiredWord: "Driver",
            correctAnswer: "He drives a car.",
          },
          {
            id: "2",
            text: "Where does he work?",
            answer: "",
            requiredWord: "Truckers Plus",
            correctAnswer: "He works at Truckers Plus.",
          },
          {
            id: "3",
            text: "Does he like it?",
            answer: "",
            requiredWord: "No",
            correctAnswer: "No, he doesn't like it.",
          },
          {
            id: "4",
            text: "What does Miyen do?",
            answer: "",
            requiredWord: "Housekeeper",
            correctAnswer: "She is a housekeeper.",
          },
          {
            id: "5",
            text: "Where does she work?",
            answer: "",
            requiredWord: "a hotel",
            correctAnswer: "She works at a hotel.",
          },
          {
            id: "6",
            text: "Does she like it?",
            answer: "",
            requiredWord: "okay",
            correctAnswer: "She thinks it's okay.",
          },
        ],
      };

      return <WritingTypingExercise {...writingTypingData} />;
    } else if (testTypingLong) {
      const typingLongData = {
        audioSrc:
          "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
      };

      return <TypingLongExercise />;
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-white p-6">
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
