import Button from "../buttons/Button";
import ClassDetailsContainer from "./ClassDetailsContainer";
import ClassModeHeaderBar from "./ClassModeHeaderBar";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import LearnerItem from "./LearnerItem";
import { useSessions } from "../data-retrieval/SessionsContext";
import { usePopUp } from "../popups/PopUpContext";
import SidePopUp from "../popups/SidePopUp";
import XButton from "../buttons/XButton";
import PhaseLineup from "./PhaseLineup";
import { useLessonPlan } from "../data-retrieval/LessonPlanContext";
import PopUpContainer from "../popups/PopUpContainer";
import ClassModePhases from "./ClassModePhases";
import ClassModeContent from "./ClassModeContent";
import { StopwatchProvider, useStopwatchControls } from "./StopwatchContext";
import ClassModeFooter from "./ClassModeFooter";
import { useResponsive } from "../ResponsiveContext";
import MobileClassModeContainer from "../mobile/MobileClassModeContainer";
import Badge from "../Badge";
import { useUserRole } from "../data-retrieval/UserRoleContext";
import { getGT } from "gt-next";
import { ButtonBarProvider } from "../mobile/ButtonBarContext";
import { createClient } from "../../../utils/supabase/client";
import Pusher from "pusher-js";
import ClassModeContentInstructor from "./ClassModeContentInstructor";
import { User } from "@/app/types/db-types";
import { LessonSummary, dummyLessonSummary } from "@/app/types/LessonSummaryType";

interface ClassModeContainerProps {
    sessionId: string;
}

export default function ClassModeContainer({
    sessionId,
}: ClassModeContainerProps) {
    // website navbar = 64, bottom margin = 16

    const dashboardHeight = window.innerHeight - 64 - 16;
    const { isMobile, isTablet, isDesktop } = useResponsive();
    const t = getGT();

    const lessonSummary: LessonSummary = dummyLessonSummary;
    const { firstName, lastName, uid } = useUserRole();

    const [activePhaseId, setActivePhaseId] = useState<string>('');

    //################################################################
    // HORSE PIG SHIT
    const { phases, getModules, lessonPlan, phaseTimes, isLoading } =
        useLessonPlan();
    //################################################################

    if (isLoading) {
        return <div></div>;
    }


    const [members, setMembers] = useState<User[]>([]);
    const [totalElapsedTime, setTotalElapsedTime] = useState([0]);

    const [instructorContent, setInstructorContent] = useState<string>('InstructorContent defined inside ClassModeContainer');
    const [showInitialClassPage, setShowInitialClassPage] = useState(true);
    const [classStarted, setClassStarted] = useState(false);
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    const [activeModuleID, setActiveModuleID] = useState<string>('');
    const [activeModuleIndex, setActiveModuleIndex] = useState(0);
    const [activeModule, setActiveModule] = useState<ModuleData>('');

    const supabase = createClient();

    useEffect(() => {
        // automatic retrieval of active module ID
        if (!lessonSummary.id) return;

        const channelName = `lessons_new:lessonId-${lessonSummary.id}`; // dynamic to avoid conflict

        const subscription = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'lessons_new',
                    filter: `id=eq.${lessonSummary.id}`,
                },
                (payload) => {
                    const newModuleId = payload.new.active_module_id;
                    setActiveModuleID(newModuleId);
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [lessonSummary.id]);


    useEffect(() => {
        console.log(`Retrieving module, activeModuleID is ${activeModuleID}`);
        if (!activeModuleID) return;
        const retrieveModuleFromID = async (moduleId: string) => {
            const { data, error } = await supabase
                .from('modules')
                .select('*')
                .eq('id', moduleId)
                .single();
            if (error) {
                console.error('Error fetching module data:', error);
                return;
            }
            console.log(`data is ${data}`);
            setActiveModule(data);
        };
        retrieveModuleFromID(activeModuleID);

    }, [activeModuleID]);

    const nextModuleID = (moduleId: string, summary: LessonSummary): string | "No more modules" | null => {
        const allModules = summary.phases
            .flatMap((phase) => phase.modules);

        const module = allModules.find((mod) => mod.id === moduleId);
        if (!module) {
            console.error("Current module not found");
            return null;
        }

        // Find the next module with a greater index
        const nextModule = allModules
            .filter((mod) => mod.index > module.index)
            .sort((a, b) => a.index - b.index)[0];

        if (!nextModule) {
            return "No more modules";
        }

        return nextModule.id;
    };
    const handleNextModule = async (currentModuleID: string, summary: LessonSummary): Promise<void> => {
        /*totalElapsedTime.push(
            totalElapsedTime[-1] + module.duration,
        );
        setElapsedTime(totalElapsedTime[index + 1]);*/
        const nextID = nextModuleID(currentModuleID, summary);
        if (!nextID) {
            console.error("No next module found.");
            return;
        } else if (nextID === "No more modules") {
            console.log('NO MORE MODULES TO DISPLAY');
            return;
        }

        try {
            const { data, error } = await supabase
                .from("lessons_new")
                .update({ active_module: nextID })
                .eq("id", summary.id);

            if (error) {
                console.error("Failed to update active module:", error);
                return;
            }
            console.log("Successfully updated active module:", data);
        } catch (err) {
            console.error("Error during handleNextModule execution:", err);
        }
    }; // await handleNextModule(ActiveModuleID, lessonSummary);



    // retrieve module data on update of active module

    /*
    What to write:
        - getModules
        - phases
        - phaseTimes (indexed by phaseId)
            - array of Phases, including 
        - activePhase
        - activeModule
        - activeModuleIndex
        - totalElapsedTime
    */





    /*
     PhaseLineup passes this to <ModuleDetail> [ modules={getModules(phaseId)} ]
                         V
     getModules(phaseId) returns Module[]. Index is inherent.
         key={module.id}
         active={index === activeModuleIndex}
         number={index + 1}
         title={module.name}
         description={module.description}
         done={activeModuleIndex >= index}
     */






    const [handleSubmitAnswer, setHandleSubmitAnswer] = useState<any>(
        () => () => { },
    );

    const [isSessionLoading, setIsSessionLoading] = useState(true);

    const { hidePopUp, showPopUp } = usePopUp();

    const activePhase: any = phases.find((phase) => phase.id === activePhaseId);

    const dashboardContainer = document.getElementById("class-mode-container");
    let containerHeight: number | null;
    if (dashboardContainer) {
        containerHeight = dashboardContainer.offsetHeight;
    } else {
        console.error("Element with ID 'class-mode-container' not found");
    }

    const router = useRouter();
    const handleBack = () => {
        router.push("dashboard");
    };

    const handleEndClass = () => {
        router.push("dashboard");
    };

    const handleEndClassPopUp = () => {
        showPopUp({
            id: "end-class-popup",
            content: (
                <PopUpContainer
                    header={t("button_content.end_class")}
                    primaryButtonText={t("button_content.end_class")}
                    secondaryButtonText="Cancel"
                    primaryButtonOnClick={() => handleEndClass()}
                    secondaryButtonOnClick={() => hidePopUp("end-class-popup")}
                    popUpId="end-class-popup"
                >
                    <p className="text-typeface_primary text-body-regular">
                        {t("class_mode_content.end_class_confirm_message")}
                    </p>
                </PopUpContainer>
            ),
            container: null, // Ensure this ID exists in your DOM
            style: {
                overlay: "overlay-high",
            },
            height: "auto",
        });
    };


    const handleShowLearners = () => {
        showPopUp({
            id: "learners-popup",
            content: (
                <SidePopUp
                    headerContent={
                        <div className="flex items-center justify-between font-medium text-typeface_primary text-h3">
                            {t("class_mode_content.learners")}
                            <XButton onClick={() => hidePopUp("learners-popup")} />
                        </div>
                    }
                    className="absolute right-0 top-0 flex flex-col"
                    height={containerHeight}
                >
                    <div className="flex flex-col gap-[16px]">
                        {learners.map((learner) => (
                            <LearnerItem name={learner.name} status={learner.status} />
                        ))}
                    </div>
                </SidePopUp>
            ),
            container: "#class-mode-container", // Ensure this ID exists in your DOM
            style: {
                overlay: "overlay-low rounded-[20px]",
            },
            height: "auto",
        });
    };

    const displayPhaseLineup = (phaseId: string) => {
        showPopUp({
            id: "phase-lineup-popup",
            content: (
                <SidePopUp
                    headerContent={
                        <div className="flex items-center justify-between font-medium text-typeface_primary text-h3">
                            {t("class_mode_content.phase_line_up")}
                            <XButton onClick={() => hidePopUp("phase-lineup-popup")} />
                        </div>
                    }
                    className="absolute right-0 top-0 flex flex-col"
                    height={containerHeight}
                >
                    THIS IS A PHASE LINEUP
                    <PhaseLineup
                        /*
                        PhaseLineup passes this to <ModuleDetail>
                                            V
                        getModules(phaseId) returns Module[]. Index is inherent.
                            key={module.id}
                            active={index === activeModuleIndex}
                            number={index + 1}
                            title={module.name}
                            description={module.description}
                            done={activeModuleIndex >= index}
                        */
                        modules={getModules(phaseId)}
                        activeModuleIndex={activeModuleIndex}
                    />
                </SidePopUp>
            ),
            container: "#class-mode-container", // Ensure this ID exists in your DOM
            style: {
                overlay: "overlay-low rounded-[20px]",
            },
            height: "auto",
        });
    };


    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////aaaaaaaaaaaaaa

    //TODO: Get current session, and then get info from module given number.
    const handleButtonClick = useCallback(async (courseId: string) => {
        const checkCurrentModuleID = async (sessionId: string) => {
            const { data: { session }, } = await supabase.auth.getSession();

            if (!session) {
                return router.push("/sign-in");
            }
            const { data: currentModuleIndexData, error: moduleError } = await supabase
                .from("heu_session")
                .select("active_module")
                .eq("approved", true)
                .eq("id", sessionId)
                .single();

            if (!currentModuleIndexData) {
                console.error('No "Active Module" data found.');
                return ('-1000');
            }

            if (moduleError || !currentModuleIndexData) {
                console.error("Error fetching module:", moduleError);
                return ('-1000')
            }
            console.log(`current module index data is ${JSON.stringify(currentModuleIndexData)}`);
            return currentModuleIndexData.active_module;

        };
        const mod = await checkCurrentModuleID(session.id);
        console.log(`handle button click pressed for course ${courseId}, returned module is ${mod}`);
    }, [session]);

    /*
    What I've done: set up supabase trigger
    TODO: From a moduleID and sessionID, get the module data and return it. From there, 
    */
    const fetchModuleData = useCallback(async (moduleId: string, sessionId: string) => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('modules') // Adjust the table name
            .select('*')
            .eq('id', moduleId)
            .single();

        if (error) {
            console.error('Error fetching module data:', error);
            return;
        }

        console.log('Module data:', data);
        setJsonData(data)
        // Handle the fetched data (e.g., set state)
    },
        [] // Dependencies for fetchModuleData (if any, like session)
    );

    useEffect(() => {
        const pusher = new Pusher('4d40e9afa8517ca3683b', {
            cluster: 'us2',
        });
        if (session == null || typeof session.id !== 'string') {
            return;
        }

        // Create a course-specific channel
        const courseChannel = pusher.subscribe(session.id);
        courseChannel.bind('module-index-updated', async (data: any) => {
            console.log('Received module index update:', data);
            const moduleData = await fetchModuleData(data.moduleId, session.id);
        });

        // Cleanup function
        return () => {
            courseChannel.unbind_all();
            courseChannel.unsubscribe();
        };
    }, [session]);

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    const PhaseDetails = ({ onBack }: { onBack: () => void }) => (
        <div className="flex h-full flex-col gap-[8px]">
            HERE ARE THE PHASE DETAILS
            <ClassModeHeaderBar
                onBack={onBack}
                iconName={"practice"}
                title={activePhase.name}
                rightSide={
                    <div className="flex items-center gap-[12px]">
                        <button
                            onClick={handleShowLearners}
                            className="button-primary rounded-full"
                        >
                            <svg
                                width="32"
                                height="32"
                                viewBox="0 0 32 32"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <circle cx="16" cy="16" rx="16" fill="currentBackgroundColor" />
                                <path
                                    d="M12.4282 20.4775C12.1274 20.4775 11.8911 20.4095 11.7192 20.2734C11.5474 20.1374 11.4614 19.9512 11.4614 19.7148C11.4614 19.3675 11.5653 19.0041 11.7729 18.6245C11.9842 18.245 12.2868 17.8887 12.6807 17.5557C13.0781 17.2227 13.5562 16.9523 14.1147 16.7446C14.6733 16.5369 15.3 16.4331 15.9946 16.4331C16.6929 16.4331 17.3213 16.5369 17.8799 16.7446C18.4385 16.9523 18.9147 17.2227 19.3086 17.5557C19.7061 17.8887 20.0104 18.245 20.2217 18.6245C20.4329 19.0041 20.5386 19.3675 20.5386 19.7148C20.5386 19.9512 20.4526 20.1374 20.2808 20.2734C20.1089 20.4095 19.8726 20.4775 19.5718 20.4775H12.4282ZM16 15.4771C15.6097 15.4771 15.2498 15.3714 14.9204 15.1602C14.5946 14.9489 14.3314 14.6642 14.1309 14.3062C13.9339 13.9481 13.8354 13.547 13.8354 13.103C13.8354 12.6662 13.9339 12.2723 14.1309 11.9214C14.3314 11.5669 14.5964 11.2858 14.9258 11.0781C15.2552 10.8704 15.6133 10.7666 16 10.7666C16.3903 10.7666 16.7502 10.8687 17.0796 11.0728C17.409 11.2769 17.6722 11.5562 17.8691 11.9106C18.0697 12.2616 18.1699 12.6554 18.1699 13.0923C18.1699 13.5399 18.0697 13.9445 17.8691 14.3062C17.6722 14.6642 17.409 14.9489 17.0796 15.1602C16.7502 15.3714 16.3903 15.4771 16 15.4771Z"
                                    fill="currentColor"
                                />
                            </svg>
                        </button>
                        <button
                            onClick={() => displayPhaseLineup(activePhase.id)}
                            className="button-primary rounded-full"
                        >
                            <svg
                                width="32"
                                height="32"
                                viewBox="0 0 32 32"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <rect
                                    width="32"
                                    height="32"
                                    rx="16"
                                    fill="currentBackgroundColor"
                                />
                                <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M20 11C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13L12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11H20ZM20 15C20.5523 15 21 15.4477 21 16C21 16.5523 20.5523 17 20 17H12C11.4477 17 11 16.5523 11 16C11 15.4477 11.4477 15 12 15L20 15ZM21 20C21 19.4477 20.5523 19 20 19L12 19C11.4477 19 11 19.4477 11 20C11 20.5523 11.4477 21 12 21H20C20.5523 21 21 20.5523 21 20Z"
                                    fill="currentColor"
                                />
                            </svg>
                        </button>
                    </div>
                }
            />
            <div className="flex h-full flex-col gap-[8px] rounded-[10px] outline-surface_border_tertiary">
                <div className="flex items-center gap-[12px] p-[18px]">
                    <Badge
                        bgColor="var(--surface_bg_darkest)"
                        textColor="text-typeface_highlight"
                    >
                        {activeModuleIndex + 1}
                    </Badge>
                    <p className="text-typeface_primary text-body-semibold">
                        {activeModule.name}
                    </p>
                </div>
                <ButtonBarProvider value={buttonBarContextValue}>
                    <ClassModeContentInstructor instructor_content={instructorContent} />
                </ButtonBarProvider>
            </div>
            <ClassModeFooter
                totalElapsedTime={totalElapsedTime}
                activePhase={activePhase}
                activeModule={activeModule}
                activeModuleIndex={activeModuleIndex}
                handleNextModule={handleNextModule}
                handleNextPhase={handleNextPhase}
                handleEndClass={handleEndClass}
                handlePreviousModule={handlePreviousModule}
            />
        </div>
    );

    const sharedProps = {
        activePhase,
        activePhaseId,
        setActivePhaseId,
        activeModule,
        activeModuleIndex,
        setActiveModuleIndex,
        classStarted,
        setClassStarted,
        handleStartClass,
        handleEndClass,
        handleNextModule,
        handleNextPhase,
        totalElapsedTime,
        members,
    };

    const buttonBarContextValue = {
        handleSubmitAnswer,
        setHandleSubmitAnswer,
    };

    if (!isSessionLoading) {
        if (isMobile)
            return (
                <MobileClassModeContainer {...sharedProps}>
                    <ButtonBarProvider value={buttonBarContextValue}>
                        <ClassModeContentInstructor
                            instructor_content={instructorContent || ""}
                        />
                    </ButtonBarProvider>
                </MobileClassModeContainer>
            );
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
                                session?.start_time
                                    ? new Date(session.start_time).toLocaleDateString("default", {
                                        month: "long",
                                        day: "numeric",
                                        weekday: "long",
                                    })
                                    : "Loading..."
                            }
                            subtitle={
                                session?.start_time && session?.end_time
                                    ? new Date(session.start_time).toLocaleTimeString("default", {
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: undefined,
                                    }) +
                                    " - " +
                                    new Date(session.end_time).toLocaleTimeString("default", {
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: undefined,
                                    })
                                    : "Loading..."
                            }
                            rightSide={
                                <div className="flex gap-[12px]">
                                    {classStarted && (
                                        <Button
                                            className="button-tertiary"
                                            onClick={handleEndClassPopUp}
                                        >
                                            {t("button_content.end_class")}
                                        </Button>
                                    )}
                                    <Button
                                        className="button-primary"
                                        onClick={handleStartClass}
                                        disabled={!session?.start_time}
                                    >
                                        {!classStarted ? "Start class" : "Continue class"}
                                    </Button>
                                    <Button
                                        className="button-secondary"
                                        onClick={handleResetTimer}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            }
                        />

                        <div className="flex flex-grow justify-between gap-[24px]">
                            <button onClick={() => handleButtonClick('CourseIDhere')}>Send Data to Pusher</button>
                            <div
                                className={`grid flex-grow ${phases.length === 1
                                    ? "grid-cols-1 grid-rows-1 gap-[16px]"
                                    : phases.length === 2
                                        ? "grid-cols-2 grid-rows-1 gap-[16px]"
                                        : phases.length === 3
                                            ? "grid-cols-3 grid-rows-1 gap-[16px]"
                                            : "grid-cols-3 grid-rows-2 gap-[16px]"
                                    }`}
                            >
                                {/* <ClassModePhases
                                    phases={phases}
                                    phaseTimes={phaseTimes}
                                    activePhase={activePhase}
                                    activeModule={activeModule}
                                    activeModuleIndex={activeModuleIndex}
                                    totalElapsedTime={totalElapsedTime}
                                /> */}
                            </div>
                            <ButtonBarProvider value={buttonBarContextValue}>
                                <ClassDetailsContainer lessonSummary={lessonSummary} />
                            </ButtonBarProvider>
                        </div>
                    </div>
                ) : (
                    <PhaseDetails onBack={() => setShowInitialClassPage(true)} />
                )}
            </div>
        );
    }
}
