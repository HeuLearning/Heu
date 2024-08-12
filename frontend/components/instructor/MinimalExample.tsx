import React, { useEffect, useState } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";

import Draggable from "./Draggable";
import WordBankItem from "components/exercise/WordBankItem";
import Droppable from "./Droppable";

/* The implementation details of <Item> and <ScrollableList> are not
 * relevant for this example and are therefore omitted. */

export default function MinimalExample({ text }) {
  const [items] = useState(["1", "2", "3"]);
  const [activeId, setActiveId] = useState(null);
  const [isDropped, setIsDropped] = useState(false);

  useEffect(() => {
    console.log("active id changed");
  }, [activeId]);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div>
        <div>
          {items.map((id) => (
            <Draggable key={id} id={id}>
              <WordBankItem id={id} draggable={true}>
                {id}
              </WordBankItem>
            </Draggable>
          ))}
        </div>
      </div>
      <div>
        <div>
          {items.map((id) =>
            isDropped ? (
              <Draggable key={id} id={id}>
                <WordBankItem id={id} draggable={true}>
                  {id}
                </WordBankItem>
              </Draggable>
            ) : (
              <Droppable key={id} id={id}>
                <WordBankItem id={id} droppable={true}>
                  {id}
                </WordBankItem>
              </Droppable>
            )
          )}
        </div>
      </div>

      <DragOverlay>
        <div>blah</div>
      </DragOverlay>
    </DndContext>
  );

  function handleDragStart(event) {
    console.log("drag start");
    setActiveId(event.active.id);
  }

  function handleDragEnd(event) {
    if (event.over) {
      setIsDropped(true);
    }
    setActiveId(null);
  }
}
