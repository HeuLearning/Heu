import React from "react";
import { useResponsive } from "../all/ResponsiveContext";
import Button from "../all/buttons/Button";
import { useButtonBar } from "../all/mobile/ButtonBarContext";
import { getGT } from "gt-next";
import Markdown from 'react-markdown'; // Import react-markdown

interface InstructionProps {
  instruction: string; // Define the instruction prop as a string
  onComplete: () => void; // Define the onComplete prop
}

export default function Instruction({
  instruction,
  onComplete,
}: InstructionProps) {
  return (
    <div>
      <h2 className="text-typeface_primary text-h3">
        <Markdown>{instruction}</Markdown> {/* Render the instruction as Markdown */}
      </h2>
    </div>
  );
}