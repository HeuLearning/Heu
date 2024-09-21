import React, { useState, useEffect } from "react";
import Textbox from "./Textbox";
import WordBankItem from "./WordBankItem";

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

interface ConvoFillInTheBlankExerciseProps {
  questions: Question[];
  words: Word[];
  speakers: string[];
}

const ConvoFillInTheBlankExercise: React.FC<
  ConvoFillInTheBlankExerciseProps
> = ({ questions: initialQuestions, words: initialWords, speakers }) => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [words, setWords] = useState<WordWithUsedStatus[]>(
    initialWords.map((word) => ({ ...word, used: false })),
  );

  useEffect(() => {
    const blankCount = questions.reduce(
      (count, question) =>
        count + (question.text.match(/\[__\]/g) || []).length,
      0,
    );

    if (blankCount !== initialWords.length) {
      console.warn(
        `Mismatch between number of blanks (${blankCount}) and number of words (${initialWords.length})`,
      );
    }
  }, [questions, initialWords]);

  const largestWord = words.reduce(
    (max, word) => (word.content.length > max.length ? word.content : max),
    "",
  );

  const largestWordWidth = `${Math.max(largestWord.length, "Type here".length) * 8 + 44}`;

  const handleAnswerChange = (id: string, answer: string) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q.id === id ? { ...q, answer } : q)),
    );

    setWords((prevWords) =>
      prevWords.map((word) =>
        word.content === answer
          ? { ...word, used: true }
          : word.content === questions.find((q) => q.id === id)?.answer
            ? { ...word, used: false }
            : word,
      ),
    );
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-white p-[24px]">
      <div className="flex items-start gap-[128px]">
        {/* Left Container: Questions */}
        <div className="flex flex-col">
          {questions.map((question) => {
            const parts = question.text.split("[__]");
            const speaker = speakers[question.speakerIndex];
            const isFirstSpeaker = question.speakerIndex === 0;

            return (
              <div
                key={question.id}
                className={`mb-[8px] flex items-center ${
                  !isFirstSpeaker ? "justify-end" : "justify-start"
                } mb-[8px] w-full max-w-[1000px]`}
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
                  <div className="flex min-h-[32px] min-w-0 flex-shrink flex-grow flex-wrap items-center">
                    {parts[0] && (
                      <span className="inline-flex items-center px-[10px] py-[4px] text-typeface_primary text-body-semibold">
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
                      <span className="inline-flex items-center px-[10px] py-[4px] text-typeface_primary text-body-semibold">
                        {parts[1]}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 items-center p-[4px]">
                    <div
                      className={`flex h-[24px] items-center rounded-full px-[8px] ${
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
        <div className="inline-block self-center rounded-[14px] bg-surface_bg_secondary p-[4px]">
          <div className="flex flex-col gap-[4px]">
            {words.map((word, index) => (
              <WordBankItem id={String(index)} disabled={word.used}>
                {word.content}
              </WordBankItem>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConvoFillInTheBlankExercise;
