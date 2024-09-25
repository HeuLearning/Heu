import React, { useState, useEffect } from "react";
import WordBankItem from "../../components/exercises/WordBankItem";

import {
  DndContext,
  closestCenter,
  useSensors,
  useSensor,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import Badge from "../all/Badge";

interface DragItem {
  id: string;
  content: string;
  letter: string | null;
  draggable: boolean;
  droppable: boolean;
  x: boolean;
}

interface DropItem {
  id: string;
  letter: string | null;
  content: string;
  droppable: boolean;
  draggable: boolean;
  x: boolean;
}

function MatchingExercise() {
  const [dropItems, setDropItems] = useState<DropItem[]>([
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

  const [dragItems, setDragItems] = useState<DragItem[]>([
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

  const [originalDragItems, setOriginalDragItems] = useState<DragItem[]>([]);

  useEffect(() => {
    setOriginalDragItems([...dragItems]);
  }, []);

  const [placeholders, setPlaceholders] = useState([
    { id: "placeholder1", droppable: true, placeholder: true },
    { id: "placeholder2", droppable: true, placeholder: true },
    { id: "placeholder3", droppable: true, placeholder: true },
    { id: "placeholder4", droppable: true, placeholder: true },
    { id: "placeholder5", droppable: true, placeholder: true },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(MouseSensor),
    useSensor(TouchSensor),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active) {
      const overItem = dropItems.find((item) => item.id === over.id);
      const activeItem = dragItems.find((item) => item.id === active.id);

      if (overItem && activeItem) {
        setDropItems((prevItems) =>
          prevItems.map((item) =>
            item.id === over.id ? { ...activeItem, x: true } : item,
          ),
        );
        setDragItems((prevItems) =>
          prevItems.map((item) =>
            item.id === active.id ? { ...overItem, letter: null } : item,
          ),
        );
        setPlaceholders((prevItems) =>
          prevItems.map((item) =>
            item.id === `placeholder${active.id.charAt(active.id.length - 1)}`
              ? { ...item, droppable: false }
              : item,
          ),
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
        index === oldIndex ? { ...originalDragItem, x: false } : item,
      ),
    );
    setDropItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...originalDropItem } : item,
      ),
    );
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-white p-6">
      <div className="w-[243px]">
        <WordBankItem id="1">
          <Badge
            bgColor="var(--surface_bg_secondary)"
            textColor="text-typeface_primary"
          >
            <p className="uppercase">{1}</p>
          </Badge>
          What's your name?
        </WordBankItem>
        <WordBankItem id="2">
          <Badge
            bgColor="var(--surface_bg_secondary)"
            textColor="text-typeface_primary"
          >
            <p className="uppercase">{2}</p>
          </Badge>
          How do you spell your name?
        </WordBankItem>
        <WordBankItem id="3">
          <Badge
            bgColor="var(--surface_bg_secondary)"
            textColor="text-typeface_primary"
          >
            <p className="uppercase">{3}</p>
          </Badge>
          Where are you from?
        </WordBankItem>
        <WordBankItem id="4">
          <Badge
            bgColor="var(--surface_bg_secondary)"
            textColor="text-typeface_primary"
          >
            <p className="uppercase">{4}</p>
          </Badge>
          What's your address?
        </WordBankItem>
        <WordBankItem id="5">
          <Badge
            bgColor="var(--surface_bg_secondary)"
            textColor="text-typeface_primary"
          >
            <p className="uppercase">{5}</p>
          </Badge>
          Who's your teacher?
        </WordBankItem>
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
      </DndContext>
    </div>
  );
}

export default MatchingExercise;
