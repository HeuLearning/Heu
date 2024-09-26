import React, { useEffect, useState } from "react";
import MatchingExercise from "../../../components/exercises/MatchingExercise";
import ConvoFillInTheBlankExercise from "../../exercises/ConvoFillInTheBlankExercise";
import QAFillInBlankExercise from "../../../components/exercises/QAFillInTheBlankExercise";
import MultipleSelectionExercise from "../../exercises/MultipleSelectionExercise";
import WritingTypingExercise from "../../exercises/WritingTypingExercise";
import { useStopwatchState } from "./StopwatchContext";
import TypingLongExercise from "@/components/exercises/TypingLongExercise";
import { useUserRole } from "../data-retrieval/UserRoleContext";
import Button from "../buttons/Button";
import { useResponsive } from "../ResponsiveContext";
import Instruction from "@/components/exercises/Instruction";
import InLineMultipleChoice from "@/components/exercises/InLineMultipleChoice";
import MultipleChoiceExercise from "@/components/exercises/MultipleChoiceExercise";
import { useMemo } from "react";


interface ClassModeContentProps {
 jsonData: any; // Consider defining a specific type for jsonData if possible
}


function ClassModeContent({ jsonData }: ClassModeContentProps) {
 const state = useStopwatchState();
 const { elapsedTime, elapsedLapTime } = state;


 const { userRole } = useUserRole();
 const { isMobile } = useResponsive();


 const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
 const exercises = jsonData.student_data?.exercises || [];


 useEffect(() => {
   setCurrentExerciseIndex(0);
 }, [jsonData]);


 console.log("render called ok?")
 console.log(currentExerciseIndex)


 // Memoize the content rendering logic to avoid unnecessary re-renders
 const renderContent = useMemo(() => {
   console.log("THIS IS THE JSON DATA");
   console.log(jsonData.student_data?.exercises);


   if (currentExerciseIndex >= exercises.length) {
     return <div>No more exercises available.</div>;
   }


   const currentExercise = exercises[currentExerciseIndex];


   const handleComplete = () => {
     setCurrentExerciseIndex((prevIndex) => Math.min(prevIndex + 1, exercises.length));
   };


   console.log(currentExercise);
   console.log("CURRENT EXERCISE BEING SERVED")


   switch (currentExercise.question_type) {
     case "instruction":
       return <Instruction instruction={currentExercise.content.instruction} onComplete={handleComplete} />;
     case "inlinemultiplechoice":
       return <InLineMultipleChoice {...currentExercise.content} onComplete={handleComplete} />;
     case "multiplechoice":
       return <MultipleChoiceExercise {...currentExercise.content} onComplete={handleComplete}/>;
     case "qa_fill_in_blank":
       return <QAFillInBlankExercise {...currentExercise.content} onComplete={handleComplete} />;
     case "matching":
       return <MatchingExercise {...currentExercise.content} onComplete={handleComplete}/>;
     default:
       return <div>Unknown exercise type.</div>;
   }
 }, [currentExerciseIndex, jsonData]);


 return (
   <div className="flex h-full w-full items-center justify-center">
     <div className="flex flex-col">
       <p>elapsed time: {elapsedTime}</p>
       <p>elapsed time in module: {elapsedLapTime}</p>
       {renderContent}
     </div>
   </div>
 );
}


export default React.memo(ClassModeContent);
