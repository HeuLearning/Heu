import React from "react";
import MatchingExercise from "../../../components/exercises/MatchingExercise";
import ConvoFillInTheBlankExercise from "../../exercises/ConvoFillInTheBlankExercise";
import QAFillInBlankExercise from "../../../components/exercises/QAFillInTheBlankExercise";
import MultipleSelectionExercise from "../../exercises/MultipleSelectionExercise";
import WritingTypingExercise from "../../exercises/WritingTypingExercise";
import { useStopwatchState } from "./StopwatchContext";
import TypingLongExercise from "@/components/exercises/TypingLongExercise";

interface ClassModeContentProps {
  activeModuleIndex: number;
  activeModule: any;
  testConvoFillInTheBlank?: boolean;
  testMatchingExercise?: boolean;
  testQAFillInTheBlank?: boolean;
  testMultipleSelection?: boolean;
  testWritingTyping?: boolean;
  testTypingLong?: boolean;
}

function ClassModeContent({
  activeModuleIndex,
  activeModule,
  testConvoFillInTheBlank = false,
  testMatchingExercise = false,
  testQAFillInTheBlank = false,
  testMultipleSelection = false,
  testWritingTyping = false,
  testTypingLong = true,
}: ClassModeContentProps) {
  const state = useStopwatchState();
  const { elapsedTime, elapsedLapTime } = state;

  if (testQAFillInTheBlank) {
    const qaFillInBlankData = {
      questions: [
        {
          id: "q1",
          text: "[__] is your birthday?",
          answer: "",
          correctAnswer: "when",
        },
        {
          id: "q2",
          text: "What [__] is it?",
          answer: "",
          correctAnswer: "day",
        },
        {
          id: "q3",
          text: "What [__] is it?",
          answer: "",
          correctAnswer: "month",
        },
        {
          id: "q4",
          text: "What [__] is English class?",
          answer: "",
          correctAnswer: "day",
        },
        {
          id: "q5",
          text: "What [__] is September 9th?",
          answer: "",
          correctAnswer: "day",
        },
      ],
      answers: [
        "It's March 13th.",
        "It's Tuesday.",
        "It's June.",
        "It's Monday.",
        "It's Thursday.",
      ],
      words: [
        { id: "word1", content: "when" },
        { id: "word2", content: "day" },
        { id: "word3", content: "month" },
      ],
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

  return (
    <div className="flex h-full w-full items-center justify-center bg-white p-6">
      <div className="flex flex-col">
        <p>elapsed time: {elapsedTime}</p>
        <p>elapsed time in module: {elapsedLapTime}</p>
      </div>
    </div>
  );
}

export default React.memo(ClassModeContent);
