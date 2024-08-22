import React, { useState, useEffect } from "react";
import FillInTheBlankComponent from "./FillInTheBlank";

interface Question {
  id: string;
  speakerIndex: number;
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
          {questions.map((question) => {
            const parts = question.text.split("[blank]");
            const speaker = speakers[question.speakerIndex];
            const isFirstSpeaker = question.speakerIndex === 0;

            return (
              <div
                key={question.id}
                className={`mb-2 flex items-center ${
                  !isFirstSpeaker ? "justify-end" : "justify-start"
                } mb-[8px] w-full max-w-[1000px]`}
              >
                <div
                  className={`flex items-center rounded-lg ${
                    isFirstSpeaker ? "flex-row-reverse" : ""
                  }`}
                  style={{
                    width: "fit-content",
                    maxWidth: "100%",
                    minHeight: "40px",
                    borderRadius: isFirstSpeaker
                      ? "20px 14px 14px 4px"
                      : "14px 20px 4px 14px",
                    backgroundColor: isFirstSpeaker ? "#E1F1FF" : "#EDEDED",
                    padding: "4px 4.5px",
                  }}
                >
                  <div className="flex min-h-[32px] min-w-0 flex-shrink flex-grow flex-wrap items-center">
                    {parts[0] && (
                      <span className="inline-flex items-center px-[10px] py-[4px] font-semibold text-[#292929] text-sm">
                        {parts[0]}
                      </span>
                    )}
                    <FillInTheBlankComponent
                      id={question.id}
                      answer={question.answer}
                      correctAnswer={question.correctAnswer}
                      onAnswerChange={(answer) =>
                        handleAnswerChange(question.id, answer)
                      }
                    />
                    {parts[1] && (
                      <span className="inline-flex items-center px-[10px] py-[4px] font-semibold text-[#292929] text-sm">
                        {parts[1]}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 items-center p-[4px]">
                    <div
                      className={`flex h-[24px] items-center rounded-full px-[8px] ${
                        isFirstSpeaker ? "bg-[#339ED3]" : "bg-[#5B5B5B]"
                      }`}
                    >
                      <span className="font-semibold tracking-tight text-white text-sm leading-[16.94px]">
                        {speaker}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
