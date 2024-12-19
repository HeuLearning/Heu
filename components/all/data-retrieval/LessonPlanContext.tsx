import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { createClient } from "@/utils/supabase/client";

interface LessonPlan {
    session_id: string;
    lesson_plan_id: number;
    lesson_plan_name: string;
    lesson_plan_description: string;
    phases: Phase[];
}

interface Phase {
    id: string;
    name: string;
    type: string;
    description: string;
    phase_duration_seconds: number;
    modules: Module[];
}

interface Module {
    instructor_content: any;
    exercises: any;
    id: string;
    name: string;
    description: string;
    suggested_duration_seconds: number;
}

// context type
interface LessonPlanContextType {
    lessonPlan: LessonPlan;
    phases: Phase[];
    getModules: (phaseId: string) => Module[] | undefined;
    phaseTimes: Map<string, string>;
    isLoading: boolean;
    error: any;
}

// create context with initial undefined value
const LessonPlanContext = createContext<LessonPlanContextType | undefined>(
    undefined,
);

// props for provider
interface LessonPlanProviderProps {
    children: ReactNode;
    sessionId: string | null;
    accessToken: string;
}

export const LessonPlanProvider: React.FC<LessonPlanProviderProps> = ({
    children,
    sessionId,
    accessToken,
}) => {
    const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        const fetchSessionStartTime = async () => {
            if (!sessionId) return;

            const { data: session, error } = await supabase
                .from("lessons_new")
                .select("start_time")
                .eq("id", sessionId)
                .single();

            if (session?.start_time) {
                setSessionStartTime(session.start_time);
            }
        };

        fetchSessionStartTime();
    }, [sessionId]);

    useEffect(() => {
        const fetchPhases = async () => {
            console.log("FETCHING PHASES:");

            if (!sessionId) {
                setLessonPlan(null);
                setIsLoading(false);
                setError("No session ID provided");
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Fetch session data
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                const user_id = session?.user.id;

                // GET SESSIONS ASSOCIATED WITH INSTRUCTOR
                const { data: sessions, error: sessionError } = await supabase
                    .from("heu_session")
                    .select("lesson_ids")
                    .eq("approved", true)
                    .eq("id", sessionId)
                    .or(
                        `pending_instructors.cs.{${user_id}},confirmed_instructors.cs.{${user_id}},canceled_instructors.cs.{${user_id}}`,
                    );


                if (sessionError || !sessions || sessions.length === 0) {
                    throw new Error("Session not found or invalid session data.");
                }


                const sessionData = sessions[0];

                const { data: sesh, error: session2 } = await supabase
                    .from("heu_session")
                    .select("*")
                    .eq("approved", true)
                    .eq("id", sessionId)
                    .or(
                        `pending_instructors.cs.{${user_id}},confirmed_instructors.cs.{${user_id}},canceled_instructors.cs.{${user_id}}`,
                    );

                if (!sesh || sesh.length === 0) {
                    console.error("No session data found.");
                    setIsLoading(false);
                    return;
                }

                if (sesh[0].full_session) {
                    console.log("Using cached full_session data");

                    setLessonPlan(sesh[0].full_session); // Set the lesson plan directly from full_session
                    setIsLoading(false); // Stop loading
                    return; // Exit early, no need to make further API calls
                }

                // GET LESSON IDS FROM ARRAY IN SESSIONS
                const lessonIds = sessions[0].lesson_ids[0];
                const { data: lessons, error: lessonError } = await supabase
                    .from("heu_lesson")
                    .select("*")
                    .in("id", lessonIds);

                if (lessonError || !lessons || lessons.length === 0) {
                    throw new Error("No lessons found for the session.");
                }

                // GET THE LESSON PLAN
                const lessonPlanId = lessons[0].lessonplan_id;
                const { data: lessonPlan, error: lessonPlanError } = await supabase
                    .from("heu_lessonplan")
                    .select("*")
                    .eq("id", lessonPlanId)
                    .single();

                if (lessonPlanError || !lessonPlan) {
                    throw new Error("Lesson plan not found.");
                }

                // GET PHASE IDS
                const phaseIds = lessonPlan.phase_ids;
                let phasesData = [];

                // Iterate over phaseIds to fetch phase details
                for (const phaseId of phaseIds) {
                    const { data: phaseData, error: phaseError } = await supabase
                        .from("heu_phase")
                        .select("*")
                        .eq("id", phaseId)
                        .single();

                    if (phaseError || !phaseData) {
                        console.error(`Error fetching phase ${phaseId}:`, phaseError);
                        continue; // Skip this phase if there's an error
                    }

                    // Fetch modules for each phase based on module_ids
                    const modulesData = [];
                    for (const moduleId of phaseData.module_ids) {
                        const { data: moduleData, error: moduleError } = await supabase
                            .from("heu_module")
                            .select("*")
                            .eq("id", moduleId)
                            .single();

                        if (moduleError || !moduleData) {
                            console.error(`Error fetching module ${moduleId}:`, moduleError);
                            continue; // Skip this module if there's an error
                        }

                        // Fetch associated algorithm data to get exercise IDs
                        const { data: algorithmData, error: algoError } = await supabase
                            .from("heu_algorithms")
                            .select("exercise_ids")
                            .eq("id", moduleData.algo_id) // Use algo_id from moduleData
                            .single();

                        const exerciseIds = algorithmData?.exercise_ids || [];
                        const exercisesData = [];

                        if (exerciseIds.length > 0) {
                            const { data: exercises, error: exercisesError } = await supabase
                                .from("heu_exercises")
                                .select("*")
                                .in("id", exerciseIds);

                            if (exercisesError) {
                                console.error(
                                    `Error fetching exercises for module ${moduleId}:`,
                                    exercisesError,
                                );
                            } else {
                                exercisesData.push(...exercises); // Collect all exercises
                            }
                        }

                        console.log("here is the module data...")
                        console.log(moduleData)

                        // Push module into array
                        modulesData.push({
                            id: moduleData.id,
                            name: moduleData.name,
                            description: moduleData.description,
                            instructor_content: moduleData.instructor_content,
                            suggested_duration_seconds: moduleData.suggested_duration_seconds,
                            exercises: exercisesData, // Include exercises in module
                        });
                    }

                    // Calculate total phase duration
                    const phaseDuration = modulesData.reduce(
                        (total, module) => total + module.suggested_duration_seconds,
                        0,
                    );

                    // Structure the phase object
                    const phase = {
                        id: phaseData.id,
                        name: phaseData.name,
                        type: phaseData.type,
                        description: phaseData.description,
                        phase_duration_seconds: phaseDuration,
                        modules: modulesData,
                        order: phaseData.order, // Assuming 'order' exists in phaseData
                    };

                    // Add the phase to phasesData array
                    phasesData.push(phase);
                }

                // Filter and sort the phases by their order
                const validPhasesData = phasesData.filter((phase) => phase !== null);
                validPhasesData.sort((a, b) => a.order - b.order);

                console.log("FINAL SESSION DATA:", {
                    session_id: sessionId,
                    lesson_plan_id: lessonPlan.id,
                    lesson_plan_name: lessonPlan.name,
                    lesson_plan_description: lessonPlan.description,
                    phases: validPhasesData,
                });

                const finalSessionData = {
                    session_id: sessionId,
                    lesson_plan_id: lessonPlan.id,
                    lesson_plan_name: lessonPlan.name,
                    lesson_plan_description: lessonPlan.description,
                    phases: validPhasesData,
                };

                // Set the final lesson plan state
                setLessonPlan(finalSessionData);

                const { error: updateError } = await supabase
                    .from("heu_session")
                    .update({ full_session: finalSessionData })
                    .eq("id", sessionId);

                if (updateError) {
                    console.error("Error updating full_session:", updateError);
                }


            } catch (e) {
                setError(`Failed to fetch phases: ${e}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPhases();
    }, [accessToken, sessionId]);

    const phases = lessonPlan?.phases || [];

    const phaseTimes = new Map();
    // @ts-ignore: Ignore implicit 'any' type here
    let prevStartTime = new Date(sessionStartTime);

    for (let i = 0; i < phases.length; i++) {
        const phase = phases[i];
        const phaseDuration = phase.phase_duration_seconds;
        const phaseEndTime = new Date(
            new Date(prevStartTime).getTime() + phaseDuration * 1000,
        );
        const timeString =
            new Date(prevStartTime).toLocaleTimeString("default", {
                hour: "numeric",
                minute: "2-digit",
                hour12: undefined,
            }) +
            " - " +
            phaseEndTime.toLocaleTimeString("default", {
                hour: "numeric",
                minute: "2-digit",
                hour12: undefined,
            });
        phaseTimes.set(phase.id, timeString);
        prevStartTime = phaseEndTime;
    }

    const getModules = (phaseId: string): Module[] | undefined => {
        return lessonPlan?.phases.find((phase) => phase.id === phaseId)?.modules;
    };

    return (
        <LessonPlanContext.Provider
            value={{
                lessonPlan: lessonPlan || {
                    session_id: "",
                    lesson_plan_id: 0,
                    lesson_plan_name: "",
                    lesson_plan_description: "",
                    phases: [],
                }, // Provide a default value when lessonPlan is null
                phases: phases,
                getModules,
                phaseTimes: phaseTimes,
                isLoading,
                error,
            }}
        >
            {children}
        </LessonPlanContext.Provider>
    );
};

export const useLessonPlan = (): LessonPlanContextType => {
    const context = useContext(LessonPlanContext);
    if (context === undefined) {
        throw new Error("useLessonPlan must be used within a LessonPlanProvider");
    }
    return context;
};
