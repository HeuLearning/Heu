import React from "react";
import Markdown from 'react-markdown'; // Import react-markdown
import remarkGfm from 'remark-gfm'

interface InstructionProps {
    instruction: string; // Define the instruction prop as a string
    //onComplete: () => void; // Define the onComplete prop
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