import React, { useEffect, useMemo } from "react";
import { useResponsive } from "../all/ResponsiveContext";
import Button from "../all/buttons/Button";
import { getGT } from "gt-next";
import Markdown from 'react-markdown'
import dictionary from "@/dictionary";
import remarkGfm from "remark-gfm";

interface InstructionProps {
  instruction: string;
  onComplete: () => void;
}

export default function Instruction({
  instruction,
  onComplete
}: InstructionProps) {
  const { isMobile } = useResponsive();
  const t = getGT();


  return (
    <div className="flex flex-col gap-[32px]">
      <p className="text-typeface_primary text-body-regular">{instruction}</p>
    </div>
  );
}
