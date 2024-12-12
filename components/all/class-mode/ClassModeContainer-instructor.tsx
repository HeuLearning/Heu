import ClassDetailsContainer from "./ClassDetailsContainer";
import ClassModeHeaderBar from "./ClassModeHeaderBar";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import ClassModeFooter from "./ClassModeFooter";
import { useResponsive } from "../ResponsiveContext";
import Badge from "../Badge";
import { useUserRole } from "../data-retrieval/UserRoleContext";
import { getGT } from "gt-next";
import { createClient } from "../../../utils/supabase/client";

import ClassModeContentInstructor from "./ClassModeContent-Instructor";
import { dummyLessonModules, dummyLessonPhases, LessonModule, LessonPhase } from "@/app/types/LessonSummaryType";
import { emptyDBModule, Module } from "@/app/types/db-types";
import Button from "../buttons/Button";
import { usePopUp } from "../popups/PopUpContext";
import PopUpContainer from "../popups/PopUpContainer";

interface ClassModeContainerProps {
    sessionId: string;
}

export default function ClassModeContainerInstructor({
    sessionId,
}: ClassModeContainerProps) {
    const { isMobile, isTablet, isDesktop } = useResponsive();
    const { hidePopUp, showPopUp } = usePopUp();
    const dashboardHeight = window.innerHeight - 64 - 16;
    const t = getGT();


    /*//################################################################
    // HORSE PIG SHIT
    const { phases, getModules, lessonPlan, phaseTimes, isLoading } =
        useLessonPlan();
    //################################################################*/

    const [isLoading, setIsLoading] = useState(true);
    const [showInitialClassPage, setShowInitialClassPage] = useState(true);
    const [lessonInProgress, setLessonInProgress] = useState<boolean>(true);

    const [activeModuleID, setActiveModuleID] = useState<string>('');
    const [moduleChangeInProgress, setModuleChangeInProgress] = useState(false); // may not be needed. Please let me know where it would be, and delete it otherwise.
    const [activeDBModule, setActiveDBModule] = useState<Module>(emptyDBModule);


    const [lessonModuleIndex, setLessonModuleIndex] = useState<number>(0);
    const [lessonPhaseIndex, setLessonPhaseIndex] = useState<number>(0);

    const supabase = createClient();

    /* * * * * * * * * * * * * * * THIS IS TEMPORARY * * * * * * * * * * * * * * * * * */
    // in the future, this will come from a provider
    const [lessonPhases, setLessonPhases] = useState<LessonPhase[]>([]);
    const [lessonModules, setLessonModules] = useState<LessonModule[]>([]);
    //const lessonPhases: LessonPhase[] = dummyLessonPhases;
    const { lessonStartTime, lessonEndTime } = {
        lessonStartTime: new Date("2023-01-01T09:00:00Z"),
        lessonEndTime: new Date("2023-01-01T10:00:00Z")
    };
    const [lessonID, setLessonID] = useState<string>('7dd187ee-7bd7-4d6a-b161-0ce45b79bfae');
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    useEffect(() => {
        // initial moduleID, lessonInProgress DB retrieval
        if (!lessonID) return;
        const retrieveActiveModuleID = async () => {
            const { data, error } = await supabase
                .from('lessons_new')
                .select('active_module_id, in_progress')
                .eq('id', lessonID)
                .single();
            if (error) {
                console.error(`Error fetching initial module ID of ${lessonID}: ${JSON.stringify(error)}`);
                return;
            }
            setActiveModuleID(data.active_module_id);
            setLessonInProgress(data.in_progress);
        }
        retrieveActiveModuleID();
    }, [lessonID]);

    useEffect(() => {
        // retrieval of lessonPhases and lessonModules
        if (!lessonID) return;
        const retrieveData = async () => {
            const retrieveLessonPhases = async () => {
                const { data, error } = await supabase.rpc('get_phases_from_lesson_id', { lessonid: lessonID });
                if (error) {
                    console.error(`Error fetching lesson phases: ${JSON.stringify(error)}`);
                    return;
                }
                setLessonPhases(data);
            }
            const retrieveLessonModules = async () => {
                const { data, error } = await supabase.rpc('get_modules_from_lesson_id', { lessonid: lessonID });
                if (error) {
                    console.error(`Error fetching lesson modules: ${JSON.stringify(error)}`);
                    return;
                }
                setLessonModules(data);

            }
            await retrieveLessonPhases();
            await retrieveLessonModules();
            setIsLoading(false);
        }
        retrieveData();
    }, [lessonID]);

    useEffect(() => {
        // module content DB retrieval
        if (!activeModuleID) return;
        const retrieveActiveModule = async () => {
            const { data, error } = await supabase
                .from('modules_new')
                .select('*')
                .eq('id', activeModuleID)
                .single();
            if (error) {
                console.error(`Error fetching module data: ${JSON.stringify(error)}`);
                return;
            }
            setActiveDBModule(data);
        }
        retrieveActiveModule();
    }, [activeModuleID]);


    useEffect(() => {
        // setup dynamic DB update of activeModuleID, lessonInProgress
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
                    const newLessonInProgress = payload.new.in_progress;
                    setActiveModuleID(newModuleID);
                    setLessonInProgress(newLessonInProgress);
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [lessonID]);


    useEffect(() => {
        // lessonModuleIndex and lessonPhaseIndex update
        if (!activeModuleID || !lessonModules || !lessonPhases) { return };

        for (let i = 0; i < lessonModules.length; i++) {
            if (lessonModules[i].id === activeModuleID) {
                //       – if you need to keep activePhaseID, update it here
                setLessonModuleIndex(i);
                setLessonPhaseIndex(lessonModules[i].phaseIndex);
                break;
            }
        }
    }, [activeModuleID, lessonModules, lessonPhases]);


    const handleChangeModule = async (direction: string = 'next'): Promise<void> => {
        // updates active_module_id in DB

        setModuleChangeInProgress(true);

        if (!lessonModules) {
            console.error('No lesson modules found.');
            return;
        }

        let nextModuleID = null;
        if (direction === 'next') {
            if (lessonModuleIndex === lessonModules.length - 1) {
                console.error('NO MORE MODULES TO DISPLAY');
                return;
            }
            nextModuleID = lessonModules[lessonModuleIndex + 1].id;
        } else {
            if (lessonModuleIndex === 0) {
                console.error('NO MORE MODULES TO DISPLAY');
                return;
            }
            nextModuleID = lessonModules[lessonModuleIndex - 1].id;
        }

        try {
            const { data, error } = await supabase
                .from("lessons_new")
                .update({ active_module_id: nextModuleID })
                .eq("id", lessonID);

            if (error) {
                throw new Error(`Failed to update active module: ${error.message}`);
            }
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

    const handleStartClass = async () => {
        const { data, error } = await supabase
            .from('lessons_new')
            .update({ in_progress: 'TRUE', active_module_id: lessonModules[0].id })
            .eq('id', lessonID);
        if (error) {
            console.error(`Error starting class: ${error}`);
            return;
        }
    }

    const handleEndClass = async () => {
        const { data, error } = await supabase
            .from('lessons_new')
            .update({ in_progress: 'FALSE', active_module_id: lessonModules[0].id })
            .eq('id', lessonID);
        if (error) {
            console.error(`Error ending class: ${error}`);
            return;
        }
        router.push("dashboard");
    }

    const handleEndClassPopUp = () => {
        showPopUp({
            id: "end-class-popup",
            content: (
                <PopUpContainer
                    header={t("button_content.end_class")}
                    primaryButtonText={t("button_content.end_class")}
                    secondaryButtonText="Cancel"
                    primaryButtonOnClick={handleEndClass}
                    secondaryButtonOnClick={() => hidePopUp("end-class-popup")}
                    popUpId="end-class-popup"
                >
                    <p className="text-typeface_primary text-body-regular">
                        {t("class_mode_content.end_class_confirm_message")}
                    </p>
                </PopUpContainer>
            ),
            container: null,
            style: {
                overlay: "overlay-high",
            },
            height: "auto",
        });
    };


    const PhaseDetails = ({ onBack }: { onBack: () => void }) => (
        <div className="flex h-full flex-col">
            <ClassModeHeaderBar
                onBack={onBack}
                iconName={"practice"}
                title={lessonPhases[lessonPhaseIndex].name || ''}
                rightSide={
                    <div className="flex items-center gap-[12px]">
                        RIGHT SIDE (todo: handle show learners and phases)
                    </div>
                }
            />
            <div className="flex-1 flex flex-col gap-[8px] rounded-[10px] outline-surface_border_tertiary">
                <div className="flex items-center gap-[12px] p-[18px]">
                    <Badge
                        bgColor="var(--surface_bg_darkest)"
                        textColor="text-typeface_highlight"
                    >
                        {lessonModules[lessonModuleIndex].moduleIndex + 1}
                    </Badge>
                    <p className="text-typeface_primary text-body-semibold">
                        {lessonModules[lessonModuleIndex].name}
                    </p>
                </div>


                <div className="flex-1">
                    <ClassModeContentInstructor instructor_content={activeDBModule?.instructor_content} />
                </div>
            </div>
            <ClassModeFooter
                lessonModules={lessonModules}
                lessonPhases={lessonPhases}
                lessonModuleIndex={lessonModuleIndex}
                handleNextModule={async () => { handleChangeModule("next") }}
                handlePreviousModule={async () => { handleChangeModule("previous") }}
                handleEndClass={handleEndClassPopUp}
            />
        </div>
    );


    if (isLoading) {
        return (
            <div>
                Loading...
            </div>
        )
    }

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
                                className={`grid flex-grow ${lessonPhases?.length === 1
                                    ? "grid-cols-1 grid-rows-1 gap-[16px]"
                                    : lessonPhases?.length === 2
                                        ? "grid-cols-2 grid-rows-1 gap-[16px]"
                                        : lessonPhases?.length === 3
                                            ? "grid-cols-3 grid-rows-1 gap-[16px]"
                                            : "grid-cols-3 grid-rows-2 gap-[16px]"
                                    }`}
                            >

                            </div>
                            <ClassDetailsContainer lessonDescription={activeDBModule.instructor_content} />

                        </div>
                        {lessonInProgress && (
                            <Button
                                className="button-tertiary"
                                onClick={handleEndClassPopUp}
                            >
                                {t("button_content.end_class")}
                            </Button>
                        )}
                        <Button
                            className="button-primary"
                            onClick={() => {
                                if (!lessonInProgress) {
                                    handleStartClass()
                                }
                                setShowInitialClassPage(false)
                            }}
                        >
                            {lessonInProgress ? "Continue class" : "Start class"}
                        </Button>
                    </div>
                ) : (
                    <PhaseDetails onBack={() => setShowInitialClassPage(true)} />
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