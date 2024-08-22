import React, { useState } from "react";
import FillInTheBlank from "./FillInTheBlank";
import Badge from "./Badge";

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

  return (
    <div className="flex h-full w-full items-center justify-center bg-white p-6">
      <div className="flex items-start gap-[128px]">
        {/* Questions Container */}
        <div className="flex flex-col">
          <h2 className="mb-4 pl-[12px] font-normal tracking-[-0.02em] text-[#292929] text-[14px] leading-6">
            Questions:
          </h2>
          {questions.map((question, index) => (
            <div key={question.id} className="mb-4 flex h-8 w-fit items-center">
              <div className="flex items-center px-[10px]">
                <Badge number={index + 1} />
              </div>
              <div className="flex items-center">
                {question.text.split("[blank]")[0] && (
                  <span className="px-[10px] font-semibold text-[#292929] font-[Inter] text-[14px] leading-[16.94px]">
                    {question.text.split("[blank]")[0]}
                  </span>
                )}
                <FillInTheBlank
                  id={question.id}
                  answer={question.answer}
                  correctAnswer={question.correctAnswer}
                  onAnswerChange={(answer) =>
                    handleAnswerChange(question.id, answer)
                  }
                />
                <span className="px-[10px] font-semibold text-[#292929] font-[Inter] text-[14px] leading-[16.94px]">
                  {question.text.split("[blank]")[1]}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Answers Container */}
        <div className="flex flex-col">
          <h2 className="mb-[20px] pl-[10px] font-normal tracking-[-0.02em] text-[#292929] text-[14px] leading-6">
            Answers:
          </h2>
          <div className="space-y-[24px]">
            {answers.map((answer, index) => (
              <div key={index} className="flex pl-[4px]">
                <div
                  className="flex h-[24px] w-fit items-center justify-center rounded-[12px] bg-[#E1F1FF] font-semibold text-[#339ED3] text-[14px] leading-[16.94px]"
                  style={{
                    padding: "7px 8px",
                  }}
                >
                  {answer}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Word Bank Container */}
        <div
          className="flex flex-col self-center rounded-[14px] bg-[#EDEDED] p-[4px]"
          style={{
            display: "inline-block",
          }}
        >
          <div className="flex flex-col gap-[4px]">
            {words.map((word, index) => (
              <div
                key={index}
                className="flex h-[32px] w-full items-center justify-center rounded-[10px] bg-white text-[#292929] shadow-[0_0_2px_#0000000D,0_1px_2px_#0000000D]"
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

export default QAFillInBlankExercise;
