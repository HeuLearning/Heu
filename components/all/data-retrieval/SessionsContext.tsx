import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { isWithinInterval } from "date-fns";
import { useRouter } from "next/navigation";
import { createClient } from "../../../utils/supabase/client"

interface UserProps {
  userRole: "ad" | "in" | "st";
}

interface Session {
  id: number;
  start_time: string;
  end_time: string;
  max_capacity: number;
  num_enrolled: number;
  num_waitlist: number;
  learning_organization: string;
  location: string;
  approved: boolean;
  viewed: boolean;
  other_instructors: [];
}

// context type
interface InstructorSessionContextType {
  type: "instructor";
  getSessionStatus: (session) => any;
  allSessions: Session[];
  upcomingSessions: Session[];
  confirmSession: (sessionId) => void;
  cancelSession: (sessionId) => void;
}

interface LearnerSessionContextType {
  type: "learner";
  getSessionStatus: (session) => any;
  allSessions: Session[];
  upcomingSessions: Session[];
  enrollSession: (sessionId) => void;
  waitlistSession: (sessionId) => void;
  unenrollSession: (sessionId) => void;
  unwaitlistSession: (sessionId) => void;
  confirmSession: (sessionId) => void;
  cancelSession: (sessionId) => void;
}

const supabase = createClient()

type SessionContextType =
  | InstructorSessionContextType
  | LearnerSessionContextType;

// create context with initial undefined value
const SessionsContext = createContext<SessionContextType | undefined>(
  undefined
);

// props for provider
interface SessionsProviderProps {
  children: ReactNode;
  accessToken;
  userRole: string;
}

export const SessionsProvider: React.FC<SessionsProviderProps> = ({
  children,
  accessToken,
  userRole,
}) => {
  // State to hold the sessions
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const router = useRouter();

  const refreshData = () => {
    router.replace(router.asPath);
  };

  // Example effect to fetch sessions (replace with your actual data fetching logic)
  useEffect(() => {
    const fetchLearnerSessions = async () => {
      // Fetch or initialize your sessions here
      // if the user is verified then get the user's sessions
      
      const { data: session, error } = await supabase
      .from('heu_session')
      .select('*')    
      .eq('approved', true);


      console.log(session);
      
      let allSessions = [];
      if (session) {
        allSessions = session.sort((a, b) => {
          return (
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
          );
        });
        console.log(allSessions);
      }
      console.log(allSessions);
      setAllSessions(allSessions);
    };

    const fetchInstructorSessions = async () => {
      // Fetch or initialize your sessions here
      // if the user is verified then get the user's sessions
      const { data: { session } } = await supabase.auth.getSession();
      const id = session?.user.id

      const { data: sessions, error } = await supabase
      .from('heu_session')
      .select('*')
      .eq('approved', true)
      .contains('confirmed_instructors', [id]);


      console.log(sessions);
      let allSessions = [];
      if (sessions) {
        allSessions = sessions.sort((a, b) => {
          return (
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
          );
        });
      }
      console.log("instructor " + allSessions);
      setAllSessions(allSessions);
    };

    if (userRole === "in") fetchInstructorSessions();
    else if (userRole === "st") fetchLearnerSessions();
  }, [accessToken]);

  // Calculate upcoming sessions based on current time
  // upcomingSessions includes currently online sessions. checks by end time, not start time
  const upcomingSessions = allSessions
    ? allSessions.filter((session) => {
        const endTime = new Date(session.end_time);
        return endTime > new Date();
      })
    : [];

  console.log({ ...allSessions });

  // instructor session statuses: Confirmed, Online, Attended, Canceled
  // learner session statuses: Available, Enrolled, Waitlisted, Confirmed
  const getSessionStatus = (session) => {
    if (userRole === "in") {
      const startDateWithBuffer = new Date(
        new Date(session.start_time).getTime() - 5 * 60000
      );
      const endDate = new Date(session.end_time);
      let status =
        session.instructor_status.charAt(0).toUpperCase() +
        session.instructor_status.slice(1);
      if (endDate < new Date() && status === "Confirmed") {
        status = "Attended";
      } else if (
        status === "Confirmed" &&
        isWithinInterval(new Date(), {
          start: startDateWithBuffer,
          end: endDate,
        })
      ) {
        status = "Online";
      }
      return status;
    } else if (userRole === "st") {
      const endDate = new Date(session.end_time);
      if (endDate < new Date() && session.isConfirmed === "Confirmed") {
        return "Attended";
      } else if (session.isEnrolled) return "Enrolled";
      else if (session.isWaitlisted) return "Waitlisted";
      else if (session.isConfirmed) return "Confirmed";
      else if (session.num_enrolled < session.max_capacity) return "Available";
      else return "Class full";
    }
  };

  async function confirmSession(sessionId: string) {
    if (userRole === "in") {
      const { data: { session } } = await supabase.auth.getSession();
      const uuid = session?.user.id


      try {
        const { data: session, error: sessionError } = await supabase
          .from('heu_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();
          
        if (sessionError) throw sessionError;
        
        if (!session) {
          throw new Error("Session not found");
        }
        
        if (!session.approved) {
          throw new Error("This session is not approved for instructor assignment.");
        }

        const { data: userInfo, error: userInfoError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', uuid)
          .single();
  
        if (userInfoError) throw userInfoError;
  
        if (!userInfo || userInfo.role !== 'in') {
          throw new Error("Only instructors can access this route");
        }
        
        // Assuming you have these fields in your session table
        let { data: updatedSession, error: updateError } = await supabase
          .from('sessions')
          .update({
            pending_instructors: supabase.raw('array_remove(pending_instructors, ?)', [user.id]),
            confirmed_instructors: supabase.raw('array_append(confirmed_instructors, ?)', [user.id])
          })
          .eq('id', sessionId)
          .single();
  
        if (updateError) throw updateError;
        
        return { message: "Successfully confirmed to teach this session" };
  
      } catch (error) {
        console.error(error);
        return { error: error.message };
      }
    } else if (userRole === "st") {
      await handleChange("confirm", sessionId);
    }
  }

  async function cancelSession(sessionId) {
    if (userRole === "in") {
      const res = await fetch(
        `http://localhost:8000/api/instructor-sessions-detail/${sessionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, // Include the access token
          },
          body: JSON.stringify({
            task: "cancel",
          }),
        }
      );
    } else if (userRole === "st") {
      await handleChange("cancel", sessionId);
    }
  }

  async function handleChange(taskString, sessionId) {
    const res = await fetch(
      `http://localhost:8000/api/user-session-detail/${sessionId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // Include the access token
        },
        body: JSON.stringify({ task: `${taskString}` }),
      }
    );
    if (res.status < 300) {
      refreshData();
    }
  }

  async function enrollSession(sessionId) {
    await handleChange("enroll", sessionId);
  }

  async function waitlistSession(sessionId) {
    await handleChange("waitlist", sessionId);
  }

  async function unenrollSession(sessionId) {
    await handleChange("unenroll", sessionId);
  }

  async function unwaitlistSession(sessionId) {
    await handleChange("drop_waitlist", sessionId);
  }

  const getContextValue = (): SessionContextType => {
    if (userRole === "in") {
      return {
        type: "instructor",
        getSessionStatus,
        allSessions,
        upcomingSessions,
        cancelSession,
        confirmSession,
      };
    } else {
      return {
        type: "learner",
        allSessions,
        upcomingSessions,
        getSessionStatus,
        enrollSession,
        waitlistSession,
        unenrollSession,
        unwaitlistSession,
        confirmSession,
        cancelSession,
      };
    }
  };

  return (
    <SessionsContext.Provider value={getContextValue()}>
      {children}
    </SessionsContext.Provider>
  );
};

export const useSessions = ():
  | InstructorSessionContextType
  | LearnerSessionContextType => {
  const context = useContext(SessionsContext);
  if (context === undefined) {
    throw new Error("useSessions must be used within a SessionsProvider");
  }
  return context;
};

export const useInstructorSessions = (): InstructorSessionContextType => {
  const context = useSessions();
  if (context.type !== "instructor") {
    throw new Error(
      "useInstructorSessions must be used with an instructor role"
    );
  }
  return context;
};

export const useLearnerSessions = (): LearnerSessionContextType => {
  const context = useSessions();
  if (context.type !== "learner") {
    throw new Error("useLearnerSessions must be used with a learner role");
  }
  return context;
};
