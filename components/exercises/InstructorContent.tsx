import React from "react";
import { useResponsive } from "../all/ResponsiveContext";
import Button from "../all/buttons/Button";
import { useButtonBar } from "../all/mobile/ButtonBarContext";
import { getGT } from "gt-next";
import Markdown from 'react-markdown'; // Import react-markdown
import remarkGfm from 'remark-gfm'

interface InstructionProps {
    instruction: string;
    //onComplete: () => void;
}

export default function Instruction({
    instruction,
    //onComplete,
}: InstructionProps) {
    return (
        <div>
            <h2 className="text-typeface_primary text-h3">
                <Markdown remarkPlugins={[remarkGfm]}>{instruction}</Markdown>
            </h2>
        </div>
    );
}