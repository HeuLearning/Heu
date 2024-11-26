import React, { useState } from "react";
import AudioPlayer from "./AudioPlayer";
import Textbox from "./Textbox";
import Badge from "../all/Badge";
import InfoPill from "../all/InfoPill";

// const writingTypingData = {
//   audioSrc:
//     "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
//   questions: [
//     {
//       id: "1",
//       text: "What does Jorge do?",
//       answer: "",
//       requiredWord: "Driver",
//       correctAnswer: "He drives a car.",
//     },
//     {
//       id: "2",
//       text: "Where does he work?",
//       answer: "",
//       requiredWord: "Truckers Plus",
//       correctAnswer: "He works at Truckers Plus.",
//     },
//     {
//       id: "3",
//       text: "Does he like it?",
//       answer: "",
//       requiredWord: "No",
//       correctAnswer: "No, he doesn't like it.",
//     },
//     {
//       id: "4",
//       text: "What does Miyen do?",
//       answer: "",
//       requiredWord: "Housekeeper",
//       correctAnswer: "She is a housekeeper.",
//     },
//     {
//       id: "5",
//       text: "Where does she work?",
//       answer: "",
//       requiredWord: "a hotel",
//       correctAnswer: "She works at a hotel.",
//     },
//     {
//       id: "6",
//       text: "Does she like it?",
//       answer: "",
//       requiredWord: "okay",
//       correctAnswer: "She thinks it's okay.",
//     },
//   ],
// };

// return <WritingTypingExercise {...writingTypingData} />;

interface Question {
  id: string;
  text: string;
  answer: string;
  requiredWord: string;
  correctAnswer: string;
}

interface WritingTypingExerciseProps {
  audioSrc?: string;
  questions: Question[];
}

const WritingTypingExercise: React.FC<WritingTypingExerciseProps> = ({
  audioSrc,
  questions: initialQuestions,
}) => {
  const [questions, setQuestions] = useState(initialQuestions);

  const handleAnswerChange = (id: string, answer: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, answer } : q)));
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-white p-[24px]">
      <div className="flex items-center gap-[128px]">
        {/* Audio Player */}
        {audioSrc && (
          <div className="flex-shrink-0">
            <AudioPlayer audioSrc={audioSrc} title="Listen to the audio" />
          </div>
        )}

        {/* Questions, Answers, and Textboxes Container */}
        <div className="flex gap-[16px]">
          {/* Questions Container */}
          <div className="flex flex-col gap-[12px]">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="flex h-[32px] items-center gap-[8px] py-[4px]"
              >
                <Badge
                  bgColor="var(--surface_bg_secondary)"
                  textColor="text-typeface_primary"
                >
                  {index + 1}
                </Badge>
                <div className="text-typeface_primary text-body-semibold">
                  {question.text}
                </div>
              </div>
            ))}
          </div>

          {/* Answers (InfoPills) Container */}
          <div className="flex flex-col gap-[12px]">
            {questions.map((question) => (
              <div key={question.id} className="flex h-[32px] items-center">
                <InfoPill text={question.requiredWord} />
              </div>
            ))}
          </div>

          {/* Textboxes Container */}
          <div className="flex flex-col gap-[12px]">
            {questions.map((question) => (
              <div key={question.id} className="flex h-[32px] items-center">
                <Textbox
                  size="small"
                  placeholder="Answer here"
                  width="320"
                  value={question.answer}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingTypingExercise;
