import React from "react";
import MatchingExercise from "components//exercise/MatchingExercise";
import FillInTheBlankExercise from "components/exercise/FillInTheBlankExercise";
import QAFillInBlankExercise from "components/exercise/QAFillInTheBlankExercise";
import AudioSelectionExercise from "components/exercise/AudioSelectionExercise";

function ClassModeContent({
  activeModuleIndex,
  activeModule,
  testFillInTheBlank = false,
  testMatchingExercise = false,
  testQAFillInTheBlank = false,
  testAudioSelection = false,
}) {
  if (testQAFillInTheBlank) {
    const qaFillInBlankData = {
      questions: [
        {
          id: "q1",
          text: "[blank] is your birthday?",
          answer: "",
          correctAnswer: "when",
        },
        {
          id: "q2",
          text: "What [blank] is it?",
          answer: "",
          correctAnswer: "day",
        },
        {
          id: "q3",
          text: "What [blank] is it?",
          answer: "",
          correctAnswer: "month",
        },
        {
          id: "q4",
          text: "What [blank] is English class?",
          answer: "",
          correctAnswer: "day",
        },
        {
          id: "q5",
          text: "What [blank] is September 9th?",
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
  }

  if (testFillInTheBlank) {
    const fillInTheBlankData = {
      questions: [
        {
          id: "q1",
          speakerIndex: 0,
          text: "Hi, Jon! How's the [blank] today?",
          answer: "",
          correctAnswer: "weather",
        },
        {
          id: "q2",
          speakerIndex: 1,
          text: "It's bad. It's snowy and [blank].",
          answer: "",
          correctAnswer: "rainy",
        },
        {
          id: "q3",
          speakerIndex: 0,
          text: "Oh no. What's the [blank] today?",
          answer: "",
          correctAnswer: "temperature",
        },
        {
          id: "q4",
          speakerIndex: 1,
          text: "It's about 30 [blank]. It's cold in the winter!",
          answer: "",
          correctAnswer: "degrees",
        },
        {
          id: "q5",
          speakerIndex: 0,
          text: "In Haiti, it's [blank] sometimes. But it's always hot.",
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

    return <FillInTheBlankExercise {...fillInTheBlankData} />;
  }

  if (testMatchingExercise) {
    return <MatchingExercise />;
  }

  if (testAudioSelection) {
    const audioSelectionData = {
      audioTitle: "Coffee Shop",
      audioSrc:
        "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
      options: [
        "Hey",
        "Nice to meet you",
        "Last name",
        "Teacher",
        "Goodbye",
        "Last name",
        "Teacher",
        "Goodbye",
      ],
      correctAnswers: ["Hey", "Nice to meet you"],
    };

    return <AudioSelectionExercise {...audioSelectionData} />;
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-white p-6">
      Toggle Exercise
    </div>
  );
}

export default React.memo(ClassModeContent);
