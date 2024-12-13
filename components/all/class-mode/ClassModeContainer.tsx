import Button from "../buttons/Button";
import ClassDetailsContainer from "./ClassDetailsContainer";
import ClassModeHeaderBar from "./ClassModeHeaderBar";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import LearnerItem from "./LearnerItem";
import { useSessions } from "../data-retrieval/SessionsContext";
import { format } from "date-fns";
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
import { createClient } from "@/utils/supabase/client";
import { useUserRole } from "../data-retrieval/UserRoleContext";
import dictionary from "@/dictionary";
import { getGT } from "gt-next";
import ButtonBar from "../mobile/ButtonBar";
import { ButtonBarProvider } from "../mobile/ButtonBarContext";

let learners: any[] = [];

interface Learner {
    id: number;
    name: string;
    status: string;
}

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

    const { phases, getModules, lessonPlan, phaseTimes, isLoading } =
        useLessonPlan();

    if (isLoading) {
        return <div></div>;
    }

    const [activePhaseId, setActivePhaseId] = useState<string>(
        phases.length > 0 ? phases[0].id : "",
    );
    const [showInitialClassPage, setShowInitialClassPage] = useState(true);
    const [activeModuleIndex, setActiveModuleIndex] = useState(0);
    const [totalElapsedTime, setTotalElapsedTime] = useState([0]);
    const [classStarted, setClassStarted] = useState(false);
    const [learnerJoined, setLearnerJoined] = useState(false);
    const [learners, setLearners] = useState<Learner[]>([]);
    const [jsonData, setJsonData] = useState([]);

    const [handleSubmitAnswer, setHandleSubmitAnswer] = useState<any>(
        () => () => { },
    );

    const [moduleToSend, setModuleToSend] = useState<any | null>(null);

    const { userRole, firstName, lastName } = useUserRole();

    //WS
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [message, setMessage] = useState<string>("");
    const [connected, setConnected] = useState<boolean>(false);

    const { upcomingSessions } = useSessions();
    const [session, setSession] = useState<any>(null);
    const [isSessionLoading, setIsSessionLoading] = useState(true);

    const { hidePopUp, showPopUp } = usePopUp();

    const activePhase: any = phases.find((phase) => phase.id === activePhaseId);
    const activeModule: any = activePhase?.modules[activeModuleIndex];

    const dashboardContainer = document.getElementById("class-mode-container");
    let containerHeight: number | null;

    if (dashboardContainer) {
        // Calculate the height
        containerHeight = dashboardContainer.offsetHeight;
        // Use containerHeight here
    } else {
        console.error("Element with ID 'class-mode-container' not found");
        // Handle the case where the element is not found
    }

    useEffect(() => {
        console.log("Updated totalElapsedTime:", totalElapsedTime);
    }, [totalElapsedTime]);

    useEffect(() => {
        const findSession = () => {
            if (upcomingSessions && sessionId) {
                const found = upcomingSessions.find((s) => String(s.id) === sessionId);
                setSession(found || null);
                setIsSessionLoading(false);
            }
        };

        findSession();
    }, [sessionId, upcomingSessions]);

    useEffect(() => {
        setActiveModuleIndex(0);
    }, [activePhaseId]);

    useEffect(() => {
        // This function handles creating the WebSocket connection
        const joinLearner = () => {
            if (ws) {
                console.log("WebSocket is already open.");
                return;
            }

            const learner = {
                id: Date.now(),
                name: firstName + " " + lastName || "Unknown",
                status: "In class",
            };

            const websocket = new WebSocket(
                "wss://heu-websocket-yfpz8.ondigitalocean.app",
            );

            websocket.onopen = () => {
                console.log("Connected to WebSocket server");
                console.log(learner);
                setConnected(true);

                websocket.send(JSON.stringify({ type: "join", learner }));
                setLearners((prev) => [...prev, learner]);

                // Handle module sending if needed (if you have module data at the time of connection)
                if (activeModule) {
                    const moduleData = {
                        type: "NEXT_MODULE",
                        moduleId: activeModule.id,
                        moduleName: activeModule.name,
                        elapsedTime: totalElapsedTime[activeModuleIndex] || 0,
                        exercises: activeModule.exercises,
                        instructor_content: activeModule.instructor_content
                    };
                    websocket.send(JSON.stringify(moduleData));
                    console.log("Sent module data over WebSocket: ", moduleData);
                }
            };

            websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === "UPDATE_LEARNERS") {
                    setLearners(data.learners);
                }
                if (data.type === "UPDATE_DATA") {
                    setJsonData(data);
                    setTotalElapsedTime((prev) => [
                        ...prev,
                        data.student_data.elapsedTime,
                    ]);
                }
            };

            websocket.onerror = (error) => {
                console.error("WebSocket error:", error);
            };

            websocket.onclose = () => {
                console.log("Disconnected from WebSocket server");
                setConnected(false);
            };

            // Store the WebSocket instance
            setWs(websocket);
        };

        if (userRole === "st") {
            for (let i = 0; i < 5; i++) {
                joinLearner();
            }
        }
    }, [userRole]);

    useEffect(() => {
        const heartbeatInterval = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {

                ws.send(JSON.stringify({ type: "heartbeat" }));
            }
        }, 30000);

        return () => {
            clearInterval(heartbeatInterval);
        };
    }, [ws]);



    useEffect(() => {
        if (moduleToSend && activeModuleIndex !== -1) {
            // Ensure WebSocket is open
            if (ws && ws.readyState === WebSocket.OPEN) {
                const data = {
                    type: "NEXT_MODULE",
                    moduleId: moduleToSend.id,
                    moduleName: moduleToSend.name,
                    elapsedTime: moduleToSend.elapsedTime,
                    exercises: moduleToSend.exercises,
                    instructor_content: moduleToSend.instructor_content
                };

                ws.send(JSON.stringify(data));
                console.log("Sent over WebSocket: ", data);
            } else {
                console.error("WebSocket is not open or does not exist");
            }
            setModuleToSend(null);
        }
        console.log("HANDLE UPDATE HERE!!!");
    }, [moduleToSend, activeModuleIndex]);

    const controls = useStopwatchControls();
    const { stopTimer, startTimer, lapTimer, resetTimer, setElapsedTime } =
        controls;

    const router = useRouter();
    const handleBack = () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.close();
        }

        router.push("dashboard");
    };

    const handleNextModule = (module: any, index: number) => {
        totalElapsedTime.push(
            totalElapsedTime[index] + module.suggested_duration_seconds,
        );
        setElapsedTime(totalElapsedTime[index + 1]);

        // Find the index of the active phase by its ID
        const currentPhaseIndex = phases.findIndex(
            (phase) => phase.id === activePhaseId,
        );

        // Set the module data to be sent over WebSocket
        const nextModuleIndex = index + 1;

        if (nextModuleIndex < phases[currentPhaseIndex]?.modules.length) {
            setElapsedTime(totalElapsedTime[nextModuleIndex]);

            // Increment the active module index
            setActiveModuleIndex(nextModuleIndex);

            const nextModule = phases[currentPhaseIndex].modules[nextModuleIndex];
            // Set the module data to be sent over WebSocket
            setModuleToSend({
                id: activePhaseId, // Still using activePhaseId here
                name: nextModule.name,
                elapsedTime: totalElapsedTime[nextModuleIndex],
                exercises: nextModule.exercises,
                instructor_content: nextModule.instructor_content
            });

            startTimer();
            lapTimer();
        } else {
            console.log("No more modules in the current phase.");
        }
    };

    const handleNextPhase = () => {
        // Reset the elapsed time for the modules in the current phase
        const resetElapsedTime = new Array(activePhase.modules.length).fill(0);
        setTotalElapsedTime(resetElapsedTime);

        const currentPhaseIndex = phases.findIndex(
            (phase) => phase.id === activePhaseId,
        );

        if (currentPhaseIndex < phases.length - 1) {
            const nextPhase = phases[currentPhaseIndex + 1];
            setActivePhaseId(nextPhase.id);
            setActiveModuleIndex(0); // Reset to the first module of the new phase
            setTotalElapsedTime([0]); // Add a new elapsed time for the new phase
            setElapsedTime(0); // Reset elapsed time for the new phase
            resetTimer();
            startTimer(); // Start the timer for the new phase

            const nextPhaseIndex =
                phases.findIndex((phase) => phase.id === activePhaseId) + 1;
            if (nextPhaseIndex < phases.length) {
                const nextPhase = phases[nextPhaseIndex];
                // Prepare the first module data to be sent
                const firstModule = nextPhase.modules[0];
                setModuleToSend({
                    id: firstModule.id,
                    name: firstModule.name,
                    elapsedTime: 0,
                    exercises: firstModule.exercises,
                    instructor_content: firstModule.instructor_content
                });
            } else {
                console.log("No more phases available.");
            }
        }
        resetTimer(); // Reset any previous timers
        startTimer(); // Start the timer for the new phase
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

    const handleResetTimer = () => {
        resetTimer();
        setActiveModuleIndex(0);
        setActivePhaseId(phases[0].id);
        setTotalElapsedTime([0]);
        setClassStarted(false);
    };

    const handleStartClass = () => {
        setShowInitialClassPage(false);

        // Start the class timer if it hasn't started yet
        if (userRole === "in" && !classStarted) {
            setClassStarted(true);
            startTimer();
        } else if (userRole === "st" && !classStarted) {
            setLearnerJoined(true);
        }

        // Check if WebSocket is already open or being created
        if (ws && ws.readyState === WebSocket.OPEN) {
            console.log("WebSocket is already open.");

            const moduleData = {
                type: "NEXT_MODULE",
                moduleId: activeModule.id,
                moduleName: activeModule.name,
                elapsedTime: totalElapsedTime[activeModuleIndex] || 0,
                exercises: activeModule.exercises,
                instructor_content: activeModule.instructor_content
            };

            ws.send(JSON.stringify(moduleData));
            console.log("Sent over WebSocket: ", moduleData);

            return; // Do nothing if WebSocket is already open
        }

        // Create a new WebSocket connection to the server
        const websocket = new WebSocket(
            "wss://heu-websocket-yfpz8.ondigitalocean.app",
        );

        // Create a new learner object for the current user
        const learner = {
            id: Date.now(),
            name: firstName + " " + lastName || "Unknown",
            status: "In class",
        };

        websocket.onopen = () => {
            console.log("Connected to the WebSocket server");
            setConnected(true);

            // Notify the server that a learner has joined the class
            console.log("Sending learner data:", learner);
            websocket.send(JSON.stringify({ type: "join", learner }));

            // Add the new learner to the local learners state
            setLearners((prevLearners) => [...prevLearners, learner]);

            // Now that the WebSocket is open, send the current module data
            if (activeModule) {
                const moduleData = {
                    type: "NEXT_MODULE",
                    moduleId: activeModule.id,
                    moduleName: activeModule.name,
                    elapsedTime: totalElapsedTime[activeModuleIndex] || 0,
                    exercises: activeModule.exercises,
                    instructor_content: activeModule.instructor_content
                };

                console.log("PHASE ID: " + activePhaseId);

                websocket.send(JSON.stringify(moduleData));
                console.log("Sent over WebSocket: ", moduleData);
            }
        };

        websocket.onmessage = (event) => {
            console.log("Message from server:", event.data);

            try {
                const parsedData = JSON.parse(event.data);

                // Handle the message type: updating the list of learners
                if (parsedData.type === "UPDATE_LEARNERS") {
                    setLearners(parsedData.learners); // Update the local learners state with the list from the server
                }

                if (parsedData.type === "UPDATE_DATA") {
                    setJsonData(parsedData);
                    console.log("Update data recognized"); // Update the local learners state with the list from the server
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };

        websocket.onclose = () => {
            console.log("Disconnected from the WebSocket server");
            setConnected(false);

            // Notify the server that this learner is disconnecting
            console.log("Sending disconnect data:", learner);
            websocket.send(
                JSON.stringify({ type: "disconnect", learnerId: learner.id }),
            );
        };

        websocket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        // Store the WebSocket instance in the state (if needed later)
        setWs(websocket);
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
                    <PhaseLineup
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

    const handlePreviousModule = (module: any, index: number) => {
        if (index > 0) {
            const previousModuleIndex = index - 1;

            // Find the index of the active phase
            const currentPhaseIndex = phases.findIndex(
                (phase) => phase.id === activePhaseId,
            );

            if (previousModuleIndex >= 0) {
                setElapsedTime(totalElapsedTime[previousModuleIndex]);
                setActiveModuleIndex(previousModuleIndex);

                const previousModule = phases[currentPhaseIndex].modules[previousModuleIndex];
                // Set the module data to be sent over WebSocket
                setModuleToSend({
                    id: activePhaseId,
                    name: previousModule.name,
                    elapsedTime: totalElapsedTime[previousModuleIndex],
                    exercises: previousModule.exercises,
                    instructor_content: previousModule.instructor_content
                });

                startTimer();
                lapTimer();
            }
        }
    };

    const PhaseDetails = ({ onBack }: { onBack: () => void }) => (
        <div className="flex h-full flex-col gap-[8px]">
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
                <ButtonBarProvider value={val}>
                    <ClassModeContent jsonData={jsonData} />
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
        learners,
    };

    const val = {
        handleSubmitAnswer,
        setHandleSubmitAnswer,
    };

    if (!isSessionLoading) {
        if (userRole == "st") {
            if (isMobile) {
                return (
                    <MobileClassModeContainer {...sharedProps}>
                        {/* later this will be ClassModeContent component with json data fed in */}
                        <div className="items-center">
                            <ButtonBarProvider value={val}>
                                <ClassModeContent jsonData={jsonData} />
                            </ButtonBarProvider>
                        </div>
                    </MobileClassModeContainer>
                );
            }
            return (
                <div
                    id="class-mode-container"
                    style={{ height: dashboardHeight }}
                    className="relative mb-4 ml-4 mr-4 flex flex-col rounded-[20px] bg-surface_bg_highlight p-[10px]"
                >
                    <ClassModeHeaderBar
                        onBack={handleBack}
                        title={t("class_mode_content.classroom")}
                        rightSide={
                            <div className="flex gap-[12px]">
                                {/* <Button
                  className={`${!learnerJoined ? "button-primary" : "button-secondary"} self-start`}
                  onClick={!learnerJoined ? handleStartClass : handleBack}
                  disabled={!session?.start_time}
                >
                  {!learnerJoined ? "Join class" : "Leave class"}
                </Button> */}
                            </div>
                        }
                    />
                    <ButtonBarProvider value={val}>
                        <ClassModeContent jsonData={jsonData} />
                    </ButtonBarProvider>
                </div>
            );
        } else if (userRole == "in")
            if (isMobile)
                return (
                    <MobileClassModeContainer {...sharedProps}>
                        <ButtonBarProvider value={val}>
                            <ClassModeContent jsonData={jsonData} />
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
                                <ClassModePhases
                                    phases={phases}
                                    phaseTimes={phaseTimes}
                                    activePhase={activePhase}
                                    activeModule={activeModule}
                                    activeModuleIndex={activeModuleIndex}
                                    totalElapsedTime={totalElapsedTime}
                                />
                            </div>
                            <ButtonBarProvider value={val}>
                                <ClassDetailsContainer lessonPlan={lessonPlan} />
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
