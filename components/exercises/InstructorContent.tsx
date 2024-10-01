import React, { useEffect } from "react";
import { useResponsive } from "../all/ResponsiveContext";
import Button from "../all/buttons/Button";
import { useButtonBar } from "../all/mobile/ButtonBarContext";
import { getGT } from "gt-next";
import dictionary from "@/dictionary";

interface InstructionProps {
  instruction: string;
  onComplete: () => void; // Define the onComplete prop
}

export default function Instruction({
  instruction,
  onComplete,
}: InstructionProps) {
  
  return (
    <div>
      <h2 className="text-typeface_primary text-h3">{instruction}</h2>
    </div>
  );
}
