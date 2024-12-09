import React, { useEffect, useState } from "react";
import MatchingExercise from "../../exercises/MatchingExercise";
import QAFillInBlankExercise from "../../exercises/QAFillInTheBlankExercise";
import { useResponsive } from "../ResponsiveContext";
import InLineMultipleChoice from "@/components/exercises/InLineMultipleChoice";
import MultipleChoiceExercise from "@/components/exercises/MultipleChoiceExercise";
import { useMemo } from "react";
import ButtonBar from "../mobile/ButtonBar";
import { getGT } from "gt-next";
import MultipleChoiceWithIDK from "@/components/exercises/MultipleChoiceWithIDK";
import TextSubmissionExercise from "@/components/exercises/TextSubmissionExercise";
import { Exercise } from "@/app/types/db-types";

interface ClassModeContentProps {
    exercises: Exercise[];
}

function ClassModeContentStudent({ exercises }: ClassModeContentProps) {
    const t = getGT();
    const { isMobile } = useResponsive();

    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [buttonBarText, setButtonBarText] = useState("");

    useEffect(() => {
        setCurrentExerciseIndex(0);
    }, [exercises]);

    // Memoize the content rendering logic to avoid unnecessary re-renders
    const renderContent = useMemo(() => {
        if (currentExerciseIndex >= exercises.length) {
            console.log("NO MORE EXERCISES");
            return (
                <p className="text-typeface_primary text-body-regular">
                    {t("class_mode_content.no_more_exercises")}
                </p>
            );
        }

        const currentExercise = exercises[currentExerciseIndex];

        const handleComplete = () => {
            setCurrentExerciseIndex((prevIndex) =>
                Math.min(prevIndex + 1, exercises.length),
            );
        };

        return (
            <div>
                Frontend here
                <br />
                <br />
                The content passed is {JSON.stringify(currentExercise.content)}.
                <br />
                <br />
                <button onClick={handleComplete}>
                    {"[ Click This to complete exercise ]"}
                </button>
            </div>
        )
        switch (currentExercise.question_type) {
            case "instruction":
                setButtonBarText(t("button_content.continue"));
                return (
                    <InLineMultipleChoice
                        key={currentExercise.id}
                        {...currentExercise.content} //column from DB (exercises_new table)
                        onComplete={handleComplete}
                    />
                );
            case "inlinemultiplechoice":
                setButtonBarText(t("button_content.submit_answer"));
                return (
                    <InLineMultipleChoice
                        key={currentExercise.id}
                        {...currentExercise.content}
                        onComplete={handleComplete}
                    />
                );
            case "multiplechoice":
                setButtonBarText(t("button_content.submit_answer"));
                return (
                    <MultipleChoiceExercise
                        key={currentExercise.id}
                        {...currentExercise.content}
                        onComplete={handleComplete}
                    />
                );
            case "multiplechoicewidk":
                setButtonBarText(t("button_content.submit_answer"));
                return (
                    <MultipleChoiceWithIDK
                        key={currentExercise.id}
                        {...currentExercise.content}
                        onComplete={handleComplete}
                    />
                );
            case "qa_fill_in_blank":
                setButtonBarText(t("button_content.submit_answer"));
                return (
                    <QAFillInBlankExercise
                        key={currentExercise.id}
                        {...currentExercise.content}
                        onComplete={handleComplete}
                    />
                );
            case "matching":
                setButtonBarText(t("button_content.submit_answer"));
                return (
                    <MatchingExercise
                        key={currentExercise.id}
                        {...currentExercise.content}
                        onComplete={handleComplete}
                    />
                );
            case "textsubmission":
                setButtonBarText(t("button_content.submit_answer"));
                return (
                    <TextSubmissionExercise
                        key={currentExercise.id}
                        {...currentExercise.content}
                        onComplete={handleComplete}
                    />
                );
            default:
                return <div>Unknown exercise type.</div>;
        }

    }, [currentExerciseIndex, exercises]);


    return (
        <div>
            <div className="flex h-full w-full items-center justify-center">
                <div className="flex flex-col">
                    {renderContent}
                </div>
            </div>
            {isMobile && (
                <div className="-ml-[16px]">
                    {buttonBarText && (
                        <ButtonBar
                            primaryButtonText={buttonBarText}
                            primaryButtonClassName="button-primary"
                            primaryButtonOnClick={() => { }}
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
            )}
        </div>
    );
}

export default React.memo(ClassModeContentStudent);
