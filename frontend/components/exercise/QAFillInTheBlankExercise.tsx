import React, { useState, useMemo } from "react";
import Textbox from "./Textbox";
import CircledLabel from "../instructor/CircledLabel";
import InfoPill from "../instructor/InfoPill";

interface Question {
  id: string;
  text: string;
  answer: string;
  correctAnswer: string;
}

interface Word {
  id: string;
  content: string;
}

interface QAFillInBlankExerciseProps {
  questions: Question[];
  answers: string[];
  words: Word[];
}

const QAFillInBlankExercise: React.FC<QAFillInBlankExerciseProps> = ({
  questions: initialQuestions,
  answers,
  words,
}) => {
  const [questions, setQuestions] = useState(initialQuestions);

  const handleAnswerChange = (id: string, answer: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, answer } : q)));
  };

  const largestWordWidth = useMemo(() => {
    const largestWord = words.reduce(
      (max, word) => (word.content.length > max.length ? word.content : max),
      ""
    );
    return `calc(${Math.max(largestWord.length, "Type here".length)}ch + 20px)`;
  }, [words]);

  return (
    <div className="flex h-full w-full items-center justify-center bg-white p-6">
      <div className="flex items-start gap-32">
        {/* Questions Container */}
        <div className="flex flex-col">
          <h2 className="mb-4 pl-3 text-typeface_primary text-body-regular">
            Questions:
          </h2>
          {questions.map((question, index) => {
            const parts = question.text.split("[blank]");
            return (
              <div
                key={question.id}
                className="mb-4 flex h-8 w-fit items-center"
              >
                <div className="flex items-center px-2.5">
                  <CircledLabel
                    bgColor="var(--surface_bg_secondary)"
                    textColor="text-typeface_primary"
                  >
                    {index + 1}
                  </CircledLabel>
                </div>
                <div className="flex items-center">
                  {parts[0] && (
                    <span className="px-2.5 text-typeface_primary text-body-semibold">
                      {parts[0]}
                    </span>
                  )}
                  <Textbox
                    size="small"
                    placeholder="Type here"
                    width={largestWordWidth}
                    value={question.answer}
                    onChange={(value) => handleAnswerChange(question.id, value)}
                  />
                  {parts[1] && (
                    <span className="px-2.5 text-typeface_primary text-body-semibold">
                      {parts[1]}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Answers Container */}
        <div className="flex flex-col">
          <h2 className="mb-5 pl-2.5 text-typeface_primary text-body-regular">
            Answers:
          </h2>
          <div className="space-y-6">
            {answers.map((answer, index) => (
              <div key={index} className="flex pl-1">
                <InfoPill text={answer} />
              </div>
            ))}
          </div>
        </div>

        {/* Word Bank Container */}
        <div
          className="self-center rounded-[14px] bg-surface_bg_secondary p-1"
          style={{ display: "inline-block" }}
        >
          <div className="flex flex-col gap-1">
            {words.map((word, index) => (
              <div
                key={index}
                className="flex h-8 items-center rounded-[10px] bg-white text-typeface_primary shadow-25"
                style={{
                  width: largestWordWidth,
                  padding: "11px 10px",
                }}
              >
                <span className="text-body-semibold-cap-height">
                  {word.content}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QAFillInBlankExercise;
