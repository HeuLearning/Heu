import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSessions } from "./SessionsContext";
import { format } from "date-fns";
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
  const { upcomingSessions } = useSessions();
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchPhases = async () => {
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
        let { data: session, error: sessionError } = await supabase
          .from("heu_session")
          .select("*, confirmed_instructors(id), lesson_plan(*)")
          .eq("id", sessionId)
          .single();

        if (sessionError) {
          throw new Error("Session not found");
        }

        // Check if the user is an instructor for this session
        const user = await supabase.auth.getUser();
        const userId = user.data?.user?.id;
        if (
          !userId ||
          !session.confirmed_instructors.some(
            (instructor) => instructor.id === userId,
          )
        ) {
          throw new Error("User is not an instructor for this session");
        }

        // Fetch lesson plan and associated phases
        let { data: phases, error: phasesError } = await supabase
          .from("heu_lessonplan_phases")
          .select("*, modules(*)")
          .eq("lessonplan_id", session.lesson_plan_id)
          .order("order", { ascending: true });

        if (phasesError) {
          throw new Error("No lesson plan associated with this session");
        }

        // Process the phases and modules data
        const phasesData = await Promise.all(
          phases.map(async (phase) => {
            const modulesData = phase.modules.map((module) => ({
              id: module.id,
              name: module.name,
              description: module.description,
              suggested_duration_seconds: module.suggested_duration_seconds,
            }));
            const phaseDuration = modulesData.reduce(
              (sum, module) => sum + module.suggested_duration_seconds,
              0,
            );
            return {
              id: phase.id,
              name: phase.name,
              modules: modulesData,
              phase_duration_seconds: phaseDuration,
              type: phase.type,
              description: phase.description,
            };
          }),
        );

        setLessonPlan({
          session_id: sessionId,
          lesson_plan_id: session.lesson_plan_id,
          lesson_plan_name: session.lesson_plan.name,
          lesson_plan_description: session.lesson_plan.description,
          phases: phasesData,
        });
      } catch (e) {
        setError(`Failed to fetch phases: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhases();
  }, [accessToken, sessionId]);

  useEffect(() => {
    if (upcomingSessions && upcomingSessions.length > 0 && sessionId) {
      const session = upcomingSessions.find(
        (session) => session.id === sessionId,
      );

      if (session && session.start_time) {
        try {
          const startTime = session.start_time;
          setSessionStartTime(startTime);
        } catch (error) {
          setSessionStartTime(null);
        }
      } else {
        setSessionStartTime(null);
      }
    } else {
      console.log(
        "upcomingSessions not available or empty, or sessionId not provided",
      );
    }
  }, [upcomingSessions, sessionId]);

  const phases = lessonPlan?.phases || [];

  const phaseTimes = new Map();
  let prevStartTime = new Date(sessionStartTime);
  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    const phaseDuration = phase.phase_duration_seconds;
    const phaseEndTime = new Date(
      new Date(prevStartTime).getTime() + phaseDuration * 1000,
    );
    const timeString =
      format(prevStartTime, "h:mm") + " - " + format(phaseEndTime, "h:mm");
    phaseTimes.set(phase.id, timeString);
    prevStartTime = phaseEndTime;
  }

  const getModules = (phaseId: string): Module[] | undefined => {
    return lessonPlan?.phases.find((phase) => phase.id === phaseId)?.modules;
  };

  return (
    <LessonPlanContext.Provider
      value={{
        lessonPlan: { ...lessonPlan } || null,
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
