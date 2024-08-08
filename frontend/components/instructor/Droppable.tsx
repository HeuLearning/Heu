import React from "react";
import { useDroppable } from "@dnd-kit/core";

export default function Droppable({ id, children }) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });
  const style = {
    color: isOver ? "green" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
}
