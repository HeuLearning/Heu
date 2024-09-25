import React from 'react';

interface InstructionProps {
  instruction: string;
  onComplete: () => void; // Define the onComplete prop
}

export default function Instruction({ instruction, onComplete }: InstructionProps) {
  const handleComplete = () => {
    // Call the onComplete function passed as a prop
    onComplete();
  };

  return (
    <div>
      <h2 className="text-typeface_primary text-h3">{instruction}</h2>
      <button onClick={handleComplete} className="mt-4 bg-blue-500 text-white p-2 rounded">
        Acknowledge Instruction
      </button>
    </div>
  );
}