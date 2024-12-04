import ClassDetailsContainer from "./ClassDetailsContainer";
import ClassModeHeaderBar from "./ClassModeHeaderBar";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import ClassModeFooter from "./ClassModeFooter";
import { useResponsive } from "../ResponsiveContext";
import Badge from "../Badge";
import { useUserRole } from "../data-retrieval/UserRoleContext";
import { getGT } from "gt-next";
import { ButtonBarProvider } from "../mobile/ButtonBarContext";
import { createClient } from "../../../utils/supabase/client";
import ClassModeContentInstructor from "./ClassModeContentInstructor";
import { LessonSummary, dummyLessonSummary, findPhaseMatchingModuleID, findModuleSpecialIndex, findNextModule } from "@/app/types/LessonSummaryType";
import { emptyDBModule, Module } from "@/app/types/db-types";

interface ClassModeContainerProps {
    sessionId: string;
}

export default function ClassModeContainerInstructor({
    sessionId,
}: ClassModeContainerProps) {

    const dashboardHeight = window.innerHeight - 64 - 16;
    const { isMobile, isTablet, isDesktop } = useResponsive();
    const t = getGT();

    const lessonSummary: LessonSummary = dummyLessonSummary;
    const { firstName, lastName, uid } = useUserRole();

    const [activePhaseId, setActivePhaseId] = useState<string>('');

    /*//################################################################
    // HORSE PIG SHIT
    const { phases, getModules, lessonPlan, phaseTimes, isLoading } =
        useLessonPlan();
    //################################################################*/


    const [totalElapsedTime, setTotalElapsedTime] = useState([0]);

    const [instructorContent, setInstructorContent] = useState<string>('InstructorContent defined inside ClassModeContainer');
    const [showInitialClassPage, setShowInitialClassPage] = useState(true);
    const [classStarted, setClassStarted] = useState(false);

    const [activeModuleID, setActiveModuleID] = useState<string>('');
    const [activeModule, setActiveModule] = useState<Module>(emptyDBModule);
    const [activePhaseID, setActivePhaseID] = useState<string>('');

    const [moduleChangeInProgress, setModuleChangeInProgress] = useState(false);

    const supabase = createClient();

    /* * * * * * * * * * * * * * * THIS IS TEMPORARY * * * * * * * * * * * * * * * * * */
    // in the future, this will come from a provider
    const { lessonStartTime, lessonEndTime } = {
        lessonStartTime: new Date("2023-01-01T09:00:00Z"),
        lessonEndTime: new Date("2023-01-01T10:00:00Z")
    };
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    const [lessonID, setLessonID] = useState<string>('7dd187ee-7bd7-4d6a-b161-0ce45b79bfae');

    useEffect(() => {
        const retrieveActiveModuleID = async () => {
            const { data, error } = await supabase
                .from('lessons_new')
                .select('active_module_id')
                .eq('id', lessonID)
                .single();
            if (error) {
                console.error(`Error fetching initial module ID of ${lessonID}: ${error}`);
                return;
            }
            console.log(`initial module id is ${data.active_module_id}`);
            setActiveModuleID(data.active_module_id);
            setActivePhaseID(findPhaseMatchingModuleID(lessonSummary, data.active_module_id).id);
        }
        retrieveActiveModuleID();
    }, [lessonID]);

    useEffect(() => {
        if (!activeModuleID) return;

        const retrieveActiveModule = async () => {
            const { data, error } = await supabase
                .from('modules_new')
                .select('*')
                .eq('id', activeModuleID)
                .single();
            if (error) {
                console.error(`Error fetching module data: ${error}`);
                return;
            }
            console.log(`retrieved active module ${JSON.stringify(data)}`);
            setActiveModule(data);
        }
        retrieveActiveModule();
    }, [activeModuleID]);


    useEffect(() => {
        // setup dynamic update of active module ID

        if (!lessonID) return;

        const channelName = `lessons_new:lessonId-${lessonID}`;

        const subscription = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'lessons_new',
                    filter: `id=eq.${lessonID}`,
                },
                (payload) => {
                    const newModuleID = payload.new.active_module_id;
                    console.log(`setting new module id of ${newModuleID}`);
                    setActiveModuleID(newModuleID);
                    setActivePhaseID(findPhaseMatchingModuleID(lessonSummary, newModuleID).id);
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [lessonID]);


    useEffect(() => {
        if (!activeModuleID) return;
        const retrieveModuleFromID = async () => {
            const { data, error } = await supabase
                .from('modules_new')
                .select('*')
                .eq('id', activeModuleID)
                .single();
            if (error) {
                console.error('Error fetching module data:', error);
                return;
            }

        };
        retrieveModuleFromID();
    }, [activeModuleID]);


    const getModuleID = (moduleId: string, summary: LessonSummary, direction: string = 'next'): string | "No more modules" | null => {
        /// make this also set the activePhase, and work across diff. phases
        const allModules = summary.phases
            .flatMap((phase) => phase.modules);

        const module = allModules.find((mod) => mod.id === moduleId);
        if (!module) {
            console.error("Current module not found");
            return null;
        }

        const nextModule = direction === 'next'
            ? allModules
                .filter((mod) => mod.index > module.index)
                .sort((a, b) => a.index - b.index)[0]
            : allModules
                .filter((mod) => mod.index < module.index)
                .sort((a, b) => a.index - b.index)[0];

        if (!nextModule) {
            return "No more modules";
        }

        return nextModule.id;
    };

    const handleChangeModule = async (direction: string = 'next'): Promise<void> => {
        // used when a user hits the next or previous button

        setModuleChangeInProgress(true);
        //const lessonSummary = useContext(LessonSummaryContext);

        if (!lessonSummary || !lessonSummary.phases) {
            console.error('No lesson summary found.');
            return;
        } else if (!activeModuleID) {
            console.error('No active module ID found.');
            return;
        }

        const nextModule = direction === 'next' ? findNextModule(lessonSummary, activeModuleID) : findNextModule(lessonSummary, activeModuleID, 'previous');
        if (!nextModule) {
            console.error("No next module found.");
            return;
        } else if (nextModule.name === "No More Modules") {
            console.log('NO MORE MODULES TO DISPLAY');
            return;
        }


        try {
            const { data, error } = await supabase
                .from("lessons_new")
                .update({ active_module_id: nextModule.id })
                .eq("id", lessonID);

            if (error) {
                throw new Error(`Failed to update active module: ${error.message}`);
            }

            console.log("Successfully updated active module:", data);
            setModuleChangeInProgress(false);
        } catch (err) {
            console.error("Error during handleNextModule execution:", err);
            setModuleChangeInProgress(false);
        }
    };

    const router = useRouter();
    const handleBack = () => {
        router.push("dashboard");
    };


    const PhaseDetails = ({ onBack }: { onBack: () => void }) => (
        <div className="flex h-full flex-col gap-[8px]">
            HERE ARE THE PHASE DETAILS
            <ClassModeHeaderBar
                onBack={onBack}
                iconName={"practice"}
                title={findPhaseMatchingModuleID(lessonSummary, activeModuleID).name || ""}
                rightSide={
                    <div className="flex items-center gap-[12px]">
                        RIGHT SIDE (todo: handle show learners and phases)
                    </div>
                }
            />
            <div className="flex h-full flex-col gap-[8px] rounded-[10px] outline-surface_border_tertiary">
                <div className="flex items-center gap-[12px] p-[18px]">
                    <Badge
                        bgColor="var(--surface_bg_darkest)"
                        textColor="text-typeface_highlight"
                    >
                        {findModuleSpecialIndex(lessonSummary, activeModuleID)}
                    </Badge>
                    <p className="text-typeface_primary text-body-semibold">
                        "activemodule.name"
                    </p>
                </div>
                <ClassModeContentInstructor instructor_content={activeModule?.instructor_content} />
            </div>
            <ClassModeFooter
                lessonSummary={lessonSummary}
                activeModuleID={activeModuleID}
                handleNextModule={async () => { handleChangeModule("next") }}
                handlePreviousModule={async () => { handleChangeModule("previous") }}
            />
        </div>
    );


    if (activeModuleID != '') {
        /*if (isMobile)
            return (
                <MobileClassModeContainer {...sharedProps}>
                    <ButtonBarProvider value={buttonBarContextValue}>
                        <ClassModeContentInstructor
                            instructor_content={instructorContent || ""}
                        />
                    </ButtonBarProvider>
                </MobileClassModeContainer>
            );*/
        return (
            <div
                id="class-mode-container"
                style={{ height: dashboardHeight }}
                className="relative mb-4 ml-4 mr-4 flex flex-col rounded-[20px] bg-surface_bg_highlight p-[10px]"
            >
                {showInitialClassPage ? (
                    <div className="flex h-full flex-col">
                        HERE IS SHOW_INITIAL_PAGE
                        <ClassModeHeaderBar
                            onBack={handleBack}
                            title={
                                lessonStartTime
                                    ? new Date(lessonStartTime).toLocaleDateString("default", {
                                        month: "long",
                                        day: "numeric",
                                        weekday: "long",
                                    })
                                    : "Loading..."
                            }
                            subtitle={
                                lessonStartTime && lessonEndTime
                                    ? new Date(lessonStartTime).toLocaleTimeString("default", {
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: undefined,
                                    }) +
                                    " - " +
                                    new Date(lessonEndTime).toLocaleTimeString("default", {
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: undefined,
                                    })
                                    : "Loading..."
                            }
                            rightSide={
                                <div className="flex gap-[12px]">
                                    THIS IS THE RIGHT SIDE
                                </div>
                            }
                        />

                        <div className="flex flex-grow justify-between gap-[24px]">
                            <div
                                className={`grid flex-grow ${lessonSummary.phases.length === 1
                                    ? "grid-cols-1 grid-rows-1 gap-[16px]"
                                    : lessonSummary.phases.length === 2
                                        ? "grid-cols-2 grid-rows-1 gap-[16px]"
                                        : lessonSummary.phases.length === 3
                                            ? "grid-cols-3 grid-rows-1 gap-[16px]"
                                            : "grid-cols-3 grid-rows-2 gap-[16px]"
                                    }`}
                            >

                            </div>
                            <ClassDetailsContainer lessonSummary={lessonSummary} />

                        </div>
                        <button onClick={() => setShowInitialClassPage(false)}>I starta the class-a</button>
                    </div>
                ) : (
                    <div>
                        <PhaseDetails onBack={() => setShowInitialClassPage(true)} />
                    </div>

                )}
            </div>
        );
    } else {
        return (
            <div>
                Loading...
            </div>
        )
    }
};