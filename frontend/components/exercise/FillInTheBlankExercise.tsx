import React, { useState, useEffect } from "react";
import FillInTheBlankComponent from "./FillInTheBlank";

interface Question {
  id: string;
  speakerIndex: number; // Changed from 'speaker' to 'speakerIndex'
  text: string;
  answer: string;
  correctAnswer: string;
}

interface Word {
  id: string;
  content: string;
}

interface WordWithUsedStatus extends Word {
  used: boolean;
}

interface FillInTheBlankExerciseProps {
  questions: Question[];
  words: Word[];
  speakers: string[];
}

const FillInTheBlankExercise: React.FC<FillInTheBlankExerciseProps> = ({
  questions: initialQuestions,
  words: initialWords,
  speakers,
}) => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [words, setWords] = useState<WordWithUsedStatus[]>(
    initialWords.map((word) => ({ ...word, used: false }))
  );

  useEffect(() => {
    // Check if the number of words matches the number of blanks
    const blankCount = questions.reduce(
      (count, question) =>
        count + (question.text.match(/\[blank\]/g) || []).length,
      0
    );

    if (blankCount !== initialWords.length) {
      console.warn(
        `Mismatch between number of blanks (${blankCount}) and number of words (${initialWords.length})`
      );
    }
  }, [questions, initialWords]);

  const largestWord = words.reduce(
    (max, word) => (word.content.length > max.length ? word.content : max),
    ""
  );

  const largestWordWidth = `calc(${largestWord.length}ch + 10px)`;

  const handleAnswerChange = (id: string, answer: string) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q.id === id ? { ...q, answer } : q))
    );

    setWords((prevWords) =>
      prevWords.map((word) =>
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
              key={question.id}
              id={question.id}
              speaker={speakers[question.speakerIndex]} // Use speakerIndex to get the speaker name
              text={question.text}
              answer={question.answer}
              correctAnswer={question.correctAnswer}
              onAnswerChange={(answer) =>
                handleAnswerChange(question.id, answer)
              }
              speakers={speakers}
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
            {words.map((word, index) => (
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
