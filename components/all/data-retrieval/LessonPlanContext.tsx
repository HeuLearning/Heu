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


      const { data: sessions, error: sessionError } = await supabase
      .from("heu_session")
      .select("lesson_plan_id")
      .eq("approved", true)
      .eq("id", sessionId)
      .or(
        `pending_instructors.cs.{${user_id}},confirmed_instructors.cs.{${user_id}},canceled_instructors.cs.{${user_id}}`
      );

      console.log("Lesson Plans here:")
      console.log(sessions);

        if (sessionError) {
          throw new Error("Session not found");
        }
        
        const lessonPlanId = sessions[0].lesson_plan_id;

        console.log(lessonPlanId)

        const { data: lessonPlan, error: lessonPlanError } = await supabase
          .from("heu_lessonplan")
          .select("*")
          .eq("id", lessonPlanId)
          .single();

        
        console.log(lessonPlan);
          
        if (lessonPlanError) {
          throw new Error("No lesson plan associated with this session");
        }


        const { data: phase_ids, error: phasesError } = await supabase
        .from("heu_lessonplan_phases")
        .select("*")
        .eq("lessonplan_id", lessonPlanId)

        console.log("PHASE IDS:")
        console.log(phase_ids);
        
        const { data: phaseOrderData, error: phaseOrderError } = await supabase
        .from("heu_phasecounter")
        .select("*")
        .in("phase_id", phase_ids.map((phase) => phase.phasecounter_id));


        // Process the phases and modules data
        const phasesData = await Promise.all(
          phase_ids.map(async (phase) => {
            // Query heu_phase table based on phasecounter_id
            const { data: phaseData, error: phaseError } = await supabase
              .from("heu_phase")
              .select("*")
              .eq("id", phase.phasecounter_id)
              .single(); 

            if (phaseError) {
              console.error(`Error fetching phase ${phase.phasecounter_id}:`, phaseError);
              return null; // Skip this phase if error occurs
            }
      
            // Query heu_module table to get the modules for the phase
            const { data: modules, error: modulesError } = await supabase
              .from("heu_module")
              .select("*")
              .eq("id", phase.phasecounter_id);
            
            if (modulesError) {
              console.error(`Error fetching modules for phase ${phase.phasecounter_id}:`, modulesError);
              return null; // Skip this phase if there's an error
            }
      
            // Build modulesData with the required parameters
            const modulesData = modules.map((module) => ({
              id: module.id,
              name: module.name,
              description: module.description,
              suggested_duration_seconds: module.suggested_duration_seconds,
            }));
      
            // Calculate total duration for the phase
            const phaseDuration = modulesData.reduce(
              (sum, module) => sum + module.suggested_duration_seconds,
              0
            );
            



            // Return the structured phase data
            return {
              id: phaseData.id,
              name: phaseData.name,
              modules: modulesData,
              phase_duration_seconds: phaseDuration,
              type: phaseData.type,
              description: phaseData.description,
              order: phaseOrderData.find((order) => order.phase_id === phase.phasecounter_id)?.order,
            };
          })
        );

        const validPhasesData = phasesData.filter((phase) => phase !== null);
        validPhasesData.sort((a, b) => a.order - b.order);

        

        console.log("FINAL SESSION DATA:")
        console.log({
          session_id: sessionId,
          lesson_plan_id: lessonPlan.id,
          lesson_plan_name: lessonPlan.name,
          lesson_plan_description: lessonPlan.description,
          phases: phasesData,
        });

        setLessonPlan({
          session_id: sessionId,
          lesson_plan_id: lessonPlan.id,
          lesson_plan_name: lessonPlan.name,
          lesson_plan_description: lessonPlan.description,
          phases: validPhasesData,
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
