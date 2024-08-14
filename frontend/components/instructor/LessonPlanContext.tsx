import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSessions } from "./SessionsContext";
import { format } from "date-fns";

interface LessonPlan {
  session_id: number;
  lesson_plan_id: number;
  lesson_plan_name: string;
  lesson_plan_description: string;
  phases: Phase[];
}

interface Phase {
  id: number;
  name: string;
  type: string;
  description: string;
  phase_duration_seconds: number;
  modules: Module[];
}

interface Module {
  id: number;
  name: string;
  description: string;
  suggested_duration_seconds: number;
}

// context type
interface LessonPlanContextType {
  lessonPlan: LessonPlan;
  phases: Phase[];
  getModules: (phaseId: number) => Module[] | undefined;
  phaseTimes;
  isLoading;
  error;
}

// create context with initial undefined value
const LessonPlanContext = createContext<LessonPlanContextType | undefined>(
  undefined
);

// props for provider
interface LessonPlanProviderProps {
  children: ReactNode;
  sessionId: string;
  accessToken: string;
}

export const LessonPlanProvider: React.FC<LessonPlanProviderProps> = ({
  children,
  sessionId,
  accessToken,
}) => {
  const [lessonPlan, setLessonPlan] = useState<LessonPlan>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { upcomingSessions } = useSessions();
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhases = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const options = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        };

        const response = await fetch(
          `http://localhost:8000/api/instructor-sessions/${sessionId}/phases`,
          options
        );

        if (response.status === 404) {
          setLessonPlan(null);
          setError("lesson plan not found");
          setIsLoading(false);
          return;
        } else if (!response.ok) {
          setLessonPlan(null);
          setIsLoading(false);
          return;
        }

        const lessonPlan = await response.json();

        setLessonPlan(lessonPlan);
      } catch (e) {
        setError(
          `Failed to fetch phases: ${
            e instanceof Error ? e.message : String(e)
          }`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhases();
  }, [accessToken, sessionId]);

  useEffect(() => {
    if (upcomingSessions && upcomingSessions.length > 0 && sessionId) {
      const session = upcomingSessions.find(
        (session) => session.id === Number(sessionId)
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
        "upcomingSessions not available or empty, or sessionId not provided"
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
      new Date(prevStartTime).getTime() + phaseDuration * 1000
    );
    const timeString =
      format(prevStartTime, "h:mm") + " - " + format(phaseEndTime, "h:mm");
    phaseTimes.set(phase.id, timeString);
    prevStartTime = phaseEndTime;
  }

  const getModules = (phaseId: number): Module[] | undefined => {
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
