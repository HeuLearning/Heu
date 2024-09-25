import WordBankItem from "./WordBankItem";

interface MultipleChoiceExerciseProps {
  instruction: string;
  question: string;
  options: string[];
  correct_answer: string;
}

export default function MultipleChoiceExercise({
  instruction,
  question,
  options,
  correct_answer,
}: MultipleChoiceExerciseProps) {
  return (
    <div className="flex flex-col">
      <p className="text-typeface_primary text-body-regular">{instruction}</p>
      <p className="text-typface_primary text-h3">{question}</p>
      {options.map((option, index) => (
        <WordBankItem key={index} id={String(index)} radio={true}>
          {option}
        </WordBankItem>
      ))}
    </div>
  );
}
