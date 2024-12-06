import { useEffect, useState } from "react";
import Button from "../buttons/Button";
import CompletionBar from "./CompletionBar";
import { getGT } from "gt-next";
import { LessonSummary } from "../data-retrieval/LessonPlanContext_new";
import { LessonModule, LessonPhase } from "@/app/types/LessonSummaryType";

interface ClassModeFooterProps {
    lessonModules: LessonModule[];
    lessonPhases: LessonPhase[];
    lessonModuleIndex: number;
    handleNextModule: () => Promise<void>
    handlePreviousModule: () => Promise<void>
    handleEndClass: () => void
}

export default function ClassModeFooter({
    lessonModules,
    lessonPhases,
    lessonModuleIndex,
    handleNextModule,
    handlePreviousModule,
    handleEndClass,
}: ClassModeFooterProps) {
    const t = getGT();

    return (
        <div className="flex items-center justify-between gap-[24px] px-[24px] pb-[10px] pt-[12px]">
            <div className="flex flex-grow gap-[8px]">
                {/*getModules(activePhase.id)?.map((module, index) => (
                    <CompletionBar
                        key={index}
                        percentage={activeModuleIndex === index
                              ? elapsedLapTime / module.suggested_duration_seconds
                              : activeModuleIndex > index
                                ? 1
                                : 0
                        }
                    />
                ))*/}
            </div>
            <p className="whitespace-nowrap text-typeface_primary text-body-semibold">
                {"time will go here"//phaseTimes.get(activePhase.id)
                }
            </p>
            <div className="flex justify-between items-center gap-[8px]">
                <Button
                    className={lessonModules[lessonModuleIndex].moduleIndex === 0 ? "button-disabled" : "button-primary"}
                    onClick={() => handlePreviousModule()}
                    disabled={lessonModules[lessonModuleIndex].moduleIndex === 0}
                >
                    {t("button_content.previous_module")}
                </Button>
                <Button
                    className="button-primary"
                    onClick={() => lessonModuleIndex === lessonModules.length - 1 ?
                        handleEndClass() :
                        handleNextModule()
                    }
                >
                    {lessonModuleIndex === lessonModules.length - 1 ?
                        t("button_content.end_class") :
                        t("button_content.next_module")
                    }
                </Button>
            </div>
        </div>
    );
}
