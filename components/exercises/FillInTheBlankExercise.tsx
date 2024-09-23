import React, { useState, useEffect } from "react";
import Textbox from "./Textbox";

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

  const largestWordWidth = `calc(${largestWord.length}ch + 20px)`;

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
      <div className="flex items-start gap-32">
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
                } mb-2 w-full max-w-[1000px]`}
              >
                <div
                  className={`flex items-center ${
                    isFirstSpeaker ? "flex-row-reverse" : ""
                  } p-1`}
                  style={{
                    width: "fit-content",
                    maxWidth: "100%",
                    minHeight: "40px",
                    borderRadius: isFirstSpeaker
                      ? "20px 14px 14px 4px"
                      : "14px 20px 4px 14px",
                    backgroundColor: isFirstSpeaker
                      ? "var(--status_bg_info)"
                      : "var(--surface_bg_secondary)",
                  }}
                >
                  <div className="flex min-h-8 min-w-0 flex-shrink flex-grow flex-wrap items-center">
                    {parts[0] && (
                      <span className="inline-flex items-center px-2.5 py-1 text-typeface_primary text-body-semibold">
                        {parts[0]}
                      </span>
                    )}
                    <Textbox
                      size="small"
                      placeholder="Type here"
                      width={largestWordWidth}
                      value={question.answer}
                      onChange={(value) =>
                        handleAnswerChange(question.id, value)
                      }
                    />
                    {parts[1] && (
                      <span className="inline-flex items-center px-2.5 py-1 text-typeface_primary text-body-semibold">
                        {parts[1]}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 items-center p-1">
                    <div
                      className={`flex h-6 items-center rounded-full px-2 ${
                        isFirstSpeaker
                          ? "bg-status_fg_info"
                          : "bg-surface_bg_darker"
                      }`}
                    >
                      <span className="text-typeface_highlight text-body-semibold-cap-height">
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
          className="self-center rounded-[14px] bg-surface_bg_secondary p-1"
          style={{
            display: "inline-block",
          }}
        >
          <div className="flex flex-col gap-1">
            {words.map((word, index) => (
              <div
                key={index}
                className={`flex h-8 items-center ${
                  word.used
                    ? "bg-surface_bg_secondary text-typeface_tertiary"
                    : "rounded-[10px] bg-white text-typeface_primary shadow-25"
                }`}
                style={{
                  width:
                    word.content.length === largestWord.length
                      ? largestWordWidth
                      : "100%",
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

export default FillInTheBlankExercise;
