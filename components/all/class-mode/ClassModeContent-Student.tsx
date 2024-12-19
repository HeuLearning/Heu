import React, { useEffect, useRef, useState } from "react";
import MatchingExercise from "../../exercises/MatchingExercise";
import QAFillInBlankExercise, { QAFillInBlankExerciseRef } from "../../exercises/QAFillInTheBlankExercise";
import { useResponsive } from "../ResponsiveContext";
import InLineMultipleChoice from "../../exercises/InLineMultipleChoice";
import MultipleChoiceExercise from "../../exercises/MultipleChoiceExercise";
import { useMemo } from "react";
import ButtonBar from "../mobile/ButtonBar";
import { getGT } from "gt-next";
import MultipleChoiceWithIDK from "../../exercises/MultipleChoiceWithIDK";
import TextSubmissionExercise from "../../exercises/TextSubmissionExercise";
import { Exercise } from "@/app/types/db-types";
import Instruction from "../../exercises/Instruction";
interface ClassModeContentProps {
    exercises: Exercise[];
    UID: string | null;
    lessonID: string | null;
    activeModuleID: string;
}

function ClassModeContentStudent({ exercises, UID, lessonID, activeModuleID }: ClassModeContentProps) {
    const t = getGT();
    const { isMobile } = useResponsive();

    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [buttonBarType, setButtonBarType] = useState<"continue" | "submit">("continue");
    const [handleSubmit, setHandleSubmit] = useState<(answers: string[]) => void>((answers: string[]) => { });
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const submitRef = useRef<QAFillInBlankExerciseRef>(null);

    useEffect(() => {
        setCurrentExerciseIndex(0);
    }, [exercises]);

    useEffect(() => {
        if (currentExerciseIndex >= exercises.length) return;

        const currentExercise = exercises[currentExerciseIndex];
        switch (currentExercise.question_type) {
            case "instruction":
                setButtonBarType("continue");
                break;
            case "qa_fill_in_blank":
            case "matching":
            case "textsubmission":
                setButtonBarType("submit");
                break;
        }
    }, [currentExerciseIndex, exercises]);

    const saveProgress = async (answers: string[]): Promise<void> => {
        try {
            const response = await fetch('/api/completeExercise', {
                method: 'POST',
                body: JSON.stringify({
                    //userID, lessonID, moduleID, exerciseID, answers
                    userID: UID,
                    lessonID: lessonID,
                    moduleID: activeModuleID,
                    exerciseID: exercises[currentExerciseIndex].id,
                    answers: answers,
                })
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('Response from API:', data);

        } catch (error) {
            console.error('Error calling backend:', error);
        }
    };

    const handleContinue = (answers: string[] = []) => {
        saveProgress(answers);
        setCurrentExerciseIndex((prevIndex) =>
            Math.min(prevIndex + 1, exercises.length),
        );
        setUserAnswers([]);
    };

    const handleButtonBarClick = () => {
        if (buttonBarType === "submit") {
            if (submitRef.current) {
                submitRef.current.handleSubmit();
            } else {
                console.log("submitRef.current is  null");
            }
        } else {
            handleContinue();
        }
    };


    // Memoize the content rendering logic to avoid unnecessary re-renders
    const renderContent = () => {
        if (currentExerciseIndex >= exercises.length) {
            console.log("NO MORE EXERCISES");

            return (
                <p className="text-typeface_primary text-body-regular">
                    {t("class_mode_content.no_more_exercises")}
                </p>
            );
        }

        const currentExercise = exercises[currentExerciseIndex];







        switch (currentExercise.question_type) {
            case "instruction":
                return (
                    <Instruction
                        key={currentExercise.id}
                        {...currentExercise.content} //column from DB (exercises_new table)
                        onComplete={handleContinue}
                    />
                );
            /* case "inlinemultiplechoice":
             
            case "multiplechoice":
             
            case "multiplechoicewidk":
                
                ); */
            case "qa_fill_in_blank":
                return (
                    <QAFillInBlankExercise
                        key={currentExercise.id}
                        ref={submitRef}
                        instruction={currentExercise.content.instruction}
                        questions={currentExercise.content.questions}
                        word_bank={currentExercise.content.word_bank}
                        correct_answer={currentExercise.content.correct_answer}
                        onComplete={handleContinue}
                        userAnswers={userAnswers}
                        setUserAnswers={setUserAnswers}
                    />
                );
            case "matching":
                return (
                    <MatchingExercise
                        key={currentExercise.id}
                        ref={submitRef}
                        instruction={currentExercise.content.instruction}
                        left_side={currentExercise.content.left_side}
                        right_side={currentExercise.content.right_side}
                        correct_answer={currentExercise.content.correct_answer}
                        onComplete={handleContinue}
                        userAnswers={userAnswers}
                        setUserAnswers={setUserAnswers}
                    />
                );
            case "textsubmission":
                return (
                    <TextSubmissionExercise
                        key={currentExercise.id}
                        ref={submitRef}
                        instruction={currentExercise.content.instruction}
                        question={currentExercise.content.question}
                        size={currentExercise.content.size}
                        correctAnswer={currentExercise.content.correctAnswer}
                        onComplete={handleContinue}
                        userAnswers={userAnswers}
                        setUserAnswers={setUserAnswers}
                    />
                );
            default:
                return <div>Unknown exercise type.</div>;
        }

    };

    return (
        <div>
            <div className="flex h-full w-full items-center justify-center">
                <div className="flex flex-col">
                    {renderContent()}
                </div>
            </div>

            <div className="-ml-[16px]">
                {buttonBarType && (
                    <ButtonBar
                        primaryButtonText={buttonBarType === "continue" ? t("button_content.continue") : t("button_content.submit_answer")}
                        primaryButtonClassName="button-primary"
                        primaryButtonOnClick={handleButtonBarClick}
                        secondaryContent={
                            <div className="flex items-center gap-[4px] pl-[8px]">
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        clip-rule="evenodd"
                                        d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14ZM7.25 4V8V8.31066L7.46967 8.53033L9.96967 11.0303L11.0303 9.96967L8.75 7.68934V4H7.25Z"
                                        fill="var(--typeface_primary)"
                                    />
                                </svg>
                                <p className="whitespace-nowrap text-typeface_primary text-body-semibold">
                                    x mins left
                                </p>
                            </div>
                        }
                    />
                )}
            </div>

        </div>
    );
}

export default React.memo(ClassModeContentStudent);
