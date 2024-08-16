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

function ClassModeContent({ activeModuleIndex, activeModule }) {
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

  const [originalDragItems, setOriginalDragItems] = useState([]);

  useEffect(() => {
    setOriginalDragItems(dragItems);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  );

  function handleDragStart(event) {
    const newActiveItem = dragItems.find((item) => item.id === event.active.id);
  }

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active) {
      const overItem = dropItems.find((item) => item.id === over.id);
      const activeItem = dragItems.find((item) => item.id === active.id);

      if (overItem && activeItem) {
        setDropItems((prevItems) => {
          return prevItems.map((item) => {
            if (item.id === over.id) {
              return { ...activeItem, x: true };
            }
            return item;
          });
        });
        setDragItems((prevItems) => {
          return prevItems.map((item) => {
            if (item.id === active.id) {
              return { ...overItem, letter: null };
            }
            return item;
          });
        });
        setPlaceholders((prevItems) => {
          return prevItems.map((item) => {
            if (item.id.charAt(-1) === active.id.charAt(-1)) {
              return { ...item, droppable: false };
            }
          });
        });
      }
    }
  };

  const handleDragDropReset = (id) => {
    const oldIndex = originalDragItems.findIndex((item) => item.id === id);
    const originalDragItem = dropItems.find((item) => item.id === id);
    const originalDropItem = dragItems[oldIndex];

    setDragItems((prevItems) => {
      const newItems = prevItems.map((item, index) => {
        if (index === oldIndex) {
          return { ...originalDragItem, x: false };
        }
        return item;
      });
      return newItems;
    });
    setDropItems((prevItems) => {
      const newItems = prevItems.map((item, index) => {
        if (item.id === id) {
          return { ...originalDropItem };
        }
        return item;
      });
      return newItems;
    });
  };

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
            {Array.from({ length: 5 }).map(() => (
              <div className="p-[8px]">
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
                    stroke-width="2"
                    stroke-linecap="round"
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
