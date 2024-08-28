import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";

export default function Draggable({ id, children, className = "" }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${className}`}
    >
      {children}
    </button>
  );
}
