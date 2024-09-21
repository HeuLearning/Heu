import React, { useState, useMemo } from "react";
import Textbox from "./Textbox";
import Badge from "../all/Badge";
import InfoPill from "../all/InfoPill";
import WordBankItem from "./WordBankItem";

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
      "",
    );
    return `${Math.max(largestWord.length, "Type here".length) * 8 + 20}`;
  }, [words]);

  return (
    <div className="flex h-full w-full items-center justify-center bg-white p-[24px]">
      <div className="flex items-start gap-[128px]">
        {/* Questions Container */}
        <div className="flex flex-col">
          <h2 className="mb-4 pl-3 text-typeface_primary text-body-regular">
            Questions:
          </h2>
          {questions.map((question, index) => {
            const parts = question.text.split("[__]");
            return (
              <div
                key={question.id}
                className="mb-[16px] flex h-[32px] w-fit items-center"
              >
                <div className="flex items-center px-[10px]">
                  <Badge
                    bgColor="var(--surface_bg_secondary)"
                    textColor="text-typeface_primary"
                  >
                    {index + 1}
                  </Badge>
                </div>
                <div className="flex items-center">
                  {parts[0] && (
                    <span className="px-[10px] text-typeface_primary text-body-semibold">
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
                    <span className="px-[10px] text-typeface_primary text-body-semibold">
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
          <h2 className="mb-[16px] pl-[10px] text-typeface_primary text-body-regular">
            Answers:
          </h2>
          <div className="flex flex-col">
            {answers.map((answer, index) => (
              <div
                key={index}
                className="mb-[16px] flex h-[32px] items-center pl-[4px]"
              >
                <InfoPill text={answer} />
              </div>
            ))}
          </div>
        </div>

        {/* Word Bank Container */}
        <div
          className="self-center rounded-[14px] bg-surface_bg_secondary p-[4px]"
          style={{ display: "inline-block" }}
        >
          <div className="flex flex-col gap-[4px]">
            {words.map((word, index) => (
              <WordBankItem id={String(index)}>{word.content}</WordBankItem>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QAFillInBlankExercise;
