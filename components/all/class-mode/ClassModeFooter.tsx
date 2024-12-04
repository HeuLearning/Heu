import { useEffect, useState } from "react";
import Button from "../buttons/Button";
import CompletionBar from "./CompletionBar";
import { getGT } from "gt-next";
import { LessonSummary } from "../data-retrieval/LessonPlanContext_new";
import { findModuleSpecialIndex } from "@/app/types/LessonSummaryType";

interface ClassModeFooterProps {
    lessonSummary: LessonSummary;
    activeModuleID: string;
    handleNextModule: () => Promise<void>
    handlePreviousModule: () => Promise<void>
}

export default function ClassModeFooter({
    lessonSummary,
    activeModuleID,
    handleNextModule,
    handlePreviousModule,
}: ClassModeFooterProps) {
    const t = getGT();


    const [activeModuleIndex, setActiveModuleIndex] = useState(0);
    useEffect(() => {
        console.log(`active module id is ${activeModuleID}`);
        setActiveModuleIndex(findModuleSpecialIndex(lessonSummary, activeModuleID));
        console.log(`active module index is ${activeModuleIndex}`);
    }, [activeModuleID]);

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
                    className={activeModuleIndex === 0 ? "button-disabled" : "button-primary"}
                    onClick={() => handlePreviousModule()}
                    disabled={activeModuleIndex === 0}
                >
                    {t("button_content.previous_module")}
                </Button>
                <Button
                    className="button-primary"
                    onClick={() => handleNextModule()
                        /*activeModuleIndex === activePhase.modules.length - 1
                            ? phases.indexOf(activePhase) === phases.length - 1
                                ? handleEndClass()
                                : handleNextPhase()
                            : handleNextModule(activeModule, activeModuleIndex)*/
                    }
                >
                    {/*activeModuleIndex === activePhase.modules.length - 1
                        ? phases.indexOf(activePhase) === phases.length - 1
                            ? t("button_content.end_class")
                            : t("button_content.next_phase")
                        : t("button_content.next_module")*/}
                    {t("button_content.next_module")}
                </Button>
            </div>
        </div>
    );
}
