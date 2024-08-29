import React from "react";
import MatchingExercise from "components//exercise/MatchingExercise";
import FillInTheBlankExercise from "components/exercise/FillInTheBlankExercise";
import QAFillInBlankExercise from "components/exercise/QAFillInTheBlankExercise";
import AudioSelectionExercise from "components/exercise/AudioSelectionExercise";
import AudioWritingExercise from "components/exercise/AudioWritingExercise";
import AudioTypingExercise from "components/exercise/AudioTypingExercise";

function ClassModeContent({
  activeModuleIndex,
  activeModule,
  testFillInTheBlank = false,
  testMatchingExercise = false,
  testQAFillInTheBlank = false,
  testAudioSelection = false,
  testAudioWriting = false,
  testAudioTyping = false,
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
      options: ["Hey", "Nice to meet you", "Last name", "Teacher", "Goodbye"],
      correctAnswers: ["Hey", "Nice to meet you"],
    };

    return <AudioSelectionExercise {...audioSelectionData} />;
  }

  if (testAudioWriting) {
    const audioWritingData = {
      audioSrc:
        "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
      questions: [
        {
          id: "1",
          text: "What does Jorge do?",
          answer: "",
          highlightedWord: "Driver",
          correctAnswer: "He drives a car.",
        },
        {
          id: "2",
          text: "Where does he work?",
          answer: "",
          highlightedWord: "Truckers Plus",
          correctAnswer: "He works at Truckers Plus.",
        },
        {
          id: "3",
          text: "Does he like it?",
          answer: "",
          highlightedWord: "No",
          correctAnswer: "No, he doesn't like it.",
        },
        {
          id: "4",
          text: "What does Miyen do?",
          answer: "",
          highlightedWord: "Housekeeper",
          correctAnswer: "She is a housekeeper.",
        },
        {
          id: "5",
          text: "Where does she work?",
          answer: "",
          highlightedWord: "a hotel",
          correctAnswer: "She works at a hotel.",
        },
        {
          id: "6",
          text: "Does she like it?",
          answer: "",
          highlightedWord: "okay",
          correctAnswer: "She thinks it's okay.",
        },
      ],
    };

    return <AudioWritingExercise {...audioWritingData} />;
  }

  if (testAudioTyping) {
    return (
      <AudioTypingExercise audioSrc="https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg" />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-white p-6">
      Toggle Exercise
    </div>
  );
}

export default React.memo(ClassModeContent);
