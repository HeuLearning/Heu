import React from "react";
import MatchingExercise from "components//exercise/MatchingExercise";
import FillInTheBlankExercise from "components/exercise/FillInTheBlankExercise";

function ClassModeContent({
  activeModuleIndex,
  activeModule,
  testFillInTheBlank = false,
  testMatchingExercise = false,
}) {
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

  return (
    <div className="flex h-full w-full items-center justify-center bg-white p-6">
      No Exercise Input
    </div>
  );
}

export default React.memo(ClassModeContent);
