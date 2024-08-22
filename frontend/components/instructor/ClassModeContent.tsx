import WordBankItem from "components/exercise/WordBankItem";
import CircledLabel from "./CircledLabel";
import {
  DndContext,
  closestCenter,
  useSensors,
  useSensor,
  PointerSensor,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core";
import { useEffect, useState } from "react";
import React from "react";
import { useStopwatchContext } from "./StopwatchContext";
import FillInTheBlank from "components/exercise/FillInTheBlank";

function ClassModeContent({
  activeModuleIndex,
  activeModule,
  testFillInTheBlank = false,
}) {
  const { state } = useStopwatchContext();
  const { elapsedTime, elapsedLapTime } = state;

  const [dropItems, setDropItems] = useState([
    {
      id: "drop1",
      letter: "",
      content: "",
      droppable: true,
      draggable: false,
      x: false,
    },
    {
      id: "drop2",
      letter: "",
      content: "",
      droppable: true,
      draggable: false,
      x: false,
    },
    {
      id: "drop3",
      letter: "",
      content: "",
      droppable: true,
      draggable: false,
      x: false,
    },
    {
      id: "drop4",
      letter: "",
      content: "",
      droppable: true,
      draggable: false,
      x: false,
    },
    {
      id: "drop5",
      letter: "",
      content: "",
      droppable: true,
      draggable: false,
      x: false,
    },
  ]);

  const [dragItems, setDragItems] = useState([
    {
      id: "drag1",
      content: "It's 19 Solo Drive.",
      letter: "A",
      draggable: true,
      droppable: false,
      x: false,
    },
    {
      id: "drag2",
      content: "I'm from China.",
      letter: "B",
      draggable: true,
      droppable: false,
      x: false,
    },
    {
      id: "drag3",
      content: "I'm Han.",
      letter: "C",
      draggable: true,
      droppable: false,
      x: false,
    },
    {
      id: "drag4",
      content: "My teacher is Gracie Smith.",
      letter: "D",
      draggable: true,
      droppable: false,
      x: false,
    },
    {
      id: "drag5",
      content: "It's H-A-N.",
      letter: "E",
      draggable: true,
      droppable: false,
      x: false,
    },
  ]);

  const [placeholders, setPlaceholders] = useState([
    { id: "placeholder1", droppable: true, placeholder: true },
    { id: "placeholder2", droppable: true, placeholder: true },
    { id: "placeholder3", droppable: true, placeholder: true },
    { id: "placeholder4", droppable: true, placeholder: true },
    { id: "placeholder5", droppable: true, placeholder: true },
  ]);

  const [questions, setQuestions] = useState([
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

  const [wordBank, setWordBank] = useState([
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

  const largestWordWidth = `calc(${largestWord.length}ch + 10px)`; // Calculate width based on the largest word's content length

  const [originalWordBank, setOriginalWordBank] = useState([]);

  useEffect(() => {
    setOriginalWordBank([...wordBank]);
  }, []);

  const [originalDragItems, setOriginalDragItems] = useState([]);

  useEffect(() => {
    setOriginalDragItems(dragItems);
  }, [dragItems]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active) {
      const overItem = dropItems.find((item) => item.id === over.id);
      const activeItem = dragItems.find((item) => item.id === active.id);

      if (overItem && activeItem) {
        setDropItems((prevItems) =>
          prevItems.map((item) =>
            item.id === over.id ? { ...activeItem, x: true } : item
          )
        );
        setDragItems((prevItems) =>
          prevItems.map((item) =>
            item.id === active.id ? { ...overItem, letter: null } : item
          )
        );
        setPlaceholders((prevItems) =>
          prevItems.map((item) =>
            item.id === `placeholder${active.id.charAt(active.id.length - 1)}`
              ? { ...item, droppable: false }
              : item
          )
        );
      }
    }
  };

  const handleDragDropReset = (id) => {
    const oldIndex = originalDragItems.findIndex((item) => item.id === id);
    const originalDragItem = dropItems.find((item) => item.id === id);
    const originalDropItem = dragItems[oldIndex];

    setDragItems((prevItems) =>
      prevItems.map((item, index) =>
        index === oldIndex ? { ...originalDragItem, x: false } : item
      )
    );
    setDropItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...originalDropItem } : item))
    );
  };

  const handleAnswerChange = (id, answer) => {
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

  if (testFillInTheBlank) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white p-6">
        <div className="flex gap-[128px]" style={{ alignItems: "flex-start" }}>
          {/* Left Container: Questions */}
          <div className="flex flex-col gap-4">
            {questions.map((question) => (
              <FillInTheBlank
                key={question.id}
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
              display: "inline-block", // Ensure the outer container hugs the inner container
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
                      ? "bg-[#EDEDED] text-[#BFBFBF]" // When the word is used
                      : "rounded-[10px] bg-white text-[#292929] shadow-[0_0_2px_#0000000D,0_1px_2px_#0000000D]" // When the word is not used
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
  }

  return (
    <div className="flex h-full flex-col gap-[28px] rounded-[10px] p-[18px] outline-surface_border_tertiary">
      <div className="flex items-center gap-[12px]">
        <CircledLabel
          bgColor="var(--surface_bg_darkest)"
          textColor="text-typeface_highlight"
        >
          {activeModuleIndex + 1}
        </CircledLabel>
        <div className="text-typeface_primary text-body-semibold">
          {activeModule.name}
        </div>
      </div>
      <div>
        <div className="flex gap-[24px]">
          <div className="w-[243px]">
            <WordBankItem id="1" letter="1">
              What's your name?
            </WordBankItem>
            <WordBankItem id="2" letter="2">
              How do you spell your name?
            </WordBankItem>
            <WordBankItem id="3" letter="3">
              Where are you from?
            </WordBankItem>
            <WordBankItem id="4" letter="4">
              What's your address?
            </WordBankItem>
            <WordBankItem id="5" letter="5">
              Who's your teacher?
            </WordBankItem>
          </div>
          <div>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="p-[8px]">
                <svg
                  width="17"
                  height="16"
                  viewBox="0 0 17 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 11.25L10.5 7.75L7 4.25"
                    stroke="var(--surface_bg_darkest)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            ))}
          </div>
          <DndContext
            sensors={sensors}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
          >
            <div className="flex gap-4">
              <div className="flex w-[263px] flex-col gap-[4px] rounded-[14px] bg-surface_bg_secondary p-[4px]">
                {dropItems.map((item) => (
                  <WordBankItem
                    key={item.id}
                    id={item.id}
                    letter={item.letter}
                    droppable={item.droppable}
                    x={item.x}
                    handleReset={() => handleDragDropReset(item.id)}
                  >
                    {item.content}
                  </WordBankItem>
                ))}
              </div>
              <div className="relative flex w-[263px] flex-col rounded-[14px] bg-surface_bg_secondary p-[4px]">
                <div className="z-[2] flex w-full flex-col gap-[4px]">
                  {dragItems.map((item) => (
                    <WordBankItem
                      key={item.id}
                      id={item.id}
                      letter={item.letter}
                      draggable={item.draggable}
                      x={item.x}
                    >
                      {item.content}
                    </WordBankItem>
                  ))}
                </div>
                <div className="border-1px absolute left-0 top-0 z-[0] flex w-[263px] flex-col gap-[4px] rounded-[14px] border-dashed border-surface_border_primary p-[4px]">
                  {placeholders.map((item) => (
                    <WordBankItem
                      key={item.id}
                      id={item.id}
                      droppable={item.droppable}
                      placeholder={item.placeholder}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div></div>
          </DndContext>
        </div>
        <div>elapsed time: {elapsedTime}</div>
        <div>elapsed module time: {elapsedLapTime}</div>
      </div>
    </div>
  );
}

export default React.memo(ClassModeContent);
