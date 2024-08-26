import React, { useState } from "react";
import FillInTheBlank from "./FillInTheBlank";
import CircledLabel from "../instructor/CircledLabel";

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
      <div className="flex items-start gap-32">
        {/* Questions Container */}
        <div className="flex flex-col">
          <h2 className="mb-4 pl-3 text-typeface_primary text-body-regular">
            Questions:
          </h2>
          {questions.map((question, index) => (
            <div key={question.id} className="mb-4 flex h-8 w-fit items-center">
              <div className="flex items-center px-2.5">
                <CircledLabel
                  bgColor="surface_bg_secondary"
                  textColor="text-typeface_primary"
                >
                  {index + 1}
                </CircledLabel>
              </div>
              <div className="flex items-center">
                {question.text.split("[blank]")[0] && (
                  <span className="px-2.5 text-typeface_primary text-body-semibold">
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
                <span className="px-2.5 text-typeface_primary text-body-semibold">
                  {question.text.split("[blank]")[1]}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Answers Container */}
        <div className="flex flex-col">
          <h2 className="mb-5 pl-2.5 text-typeface_primary text-body-regular">
            Answers:
          </h2>
          <div className="space-y-6">
            {answers.map((answer, index) => (
              <div key={index} className="flex pl-1">
                <div className="flex h-6 w-fit items-center justify-center rounded-[12px] bg-status_bg_info px-2 py-1.5 text-status_fg_info text-body-semibold">
                  {answer}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Word Bank Container */}
        <div className="self-center rounded-[14px] bg-surface_bg_secondary p-1">
          <div className="flex flex-col gap-1">
            {words.map((word, index) => (
              <div
                key={index}
                className="flex h-8 w-full items-center justify-center rounded-[10px] bg-white px-2.5 py-2.5 text-typeface_primary shadow-25 text-body-semibold"
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
