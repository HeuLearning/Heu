import React, { useState } from "react";
import FillInTheBlankComponent from "./FillInTheBlankComponent";

interface Question {
  id: string;
  speaker: string;
  text: string;
  answer: string;
  correctAnswer: string;
}

interface Word {
  id: string;
  content: string;
  used: boolean;
}

const FillInTheBlankExercise: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "q1",
      speaker: "Paula",
      text: "Hi, Jon! How's the [blank] today?",
      answer: "",
      correctAnswer: "weather",
    },
    {
      id: "q2",
      speaker: "Jon",
      text: "It's bad. It's snowy and [blank].",
      answer: "",
      correctAnswer: "rainy",
    },
    {
      id: "q3",
      speaker: "Paula",
      text: "Oh no. What's the [blank] today?",
      answer: "",
      correctAnswer: "temperature",
    },
    {
      id: "q4",
      speaker: "Jon",
      text: "It's about 30 [blank]. It's cold in the winter!",
      answer: "",
      correctAnswer: "degrees",
    },
    {
      id: "q5",
      speaker: "Paula",
      text: "In Haiti, it's [blank] sometimes. But it's always hot.",
      answer: "",
      correctAnswer: "windy",
    },
  ]);

  const [wordBank, setWordBank] = useState<Word[]>([
    { id: "word1", content: "temperature", used: false },
    { id: "word2", content: "weather", used: false },
    { id: "word3", content: "degrees", used: false },
    { id: "word4", content: "rainy", used: false },
    { id: "word5", content: "windy", used: false },
  ]);

  const largestWord = wordBank.reduce(
    (max, word) => (word.content.length > max.length ? word.content : max),
    ""
  );

  const largestWordWidth = `calc(${largestWord.length}ch + 10px)`;

  const handleAnswerChange = (id: string, answer: string) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q.id === id ? { ...q, answer } : q))
    );

    setWordBank((prevBank) =>
      prevBank.map((word) =>
        word.content === answer
          ? { ...word, used: true }
          : word.content === questions.find((q) => q.id === id)?.answer
          ? { ...word, used: false }
          : word
      )
    );
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-white p-6">
      <div className="flex gap-[128px]" style={{ alignItems: "flex-start" }}>
        {/* Left Container: Questions */}
        <div className="flex flex-col">
          {questions.map((question) => (
            <FillInTheBlankComponent
              id={question.id}
              speaker={question.speaker}
              text={question.text}
              answer={question.answer}
              correctAnswer={question.correctAnswer}
              onAnswerChange={(answer) =>
                handleAnswerChange(question.id, answer)
              }
            />
          ))}
        </div>

        {/* Right Container: Word Bank */}
        <div
          className="self-center rounded-[14px] bg-[#EDEDED] p-[4px]"
          style={{
            display: "inline-block",
          }}
        >
          <div className="flex flex-col gap-[4px]">
            {wordBank.map((word, index) => (
              <div
                key={index}
                className={`h-[32px] ${
                  word.content.length === largestWord.length
                    ? `w-[${largestWordWidth}]`
                    : "w-full"
                } flex items-center ${
                  word.used
                    ? "bg-[#EDEDED] text-[#BFBFBF]"
                    : "rounded-[10px] bg-white text-[#292929] shadow-[0_0_2px_#0000000D,0_1px_2px_#0000000D]"
                }`}
                style={{
                  padding: "11px 10px",
                  letterSpacing: "-0.02em",
                  fontSize: "14px",
                  lineHeight: "16.94px",
                  fontWeight: 600,
                }}
              >
                {word.content}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FillInTheBlankExercise;
