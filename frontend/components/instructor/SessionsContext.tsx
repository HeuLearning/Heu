import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { isWithinInterval } from "date-fns";

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
interface SessionContextType {
  getSessionStatus: (session) => any;
  allSessions: Session[];
  upcomingSessions: Session[];
}

// create context with initial undefined value
const SessionsContext = createContext<SessionContextType | undefined>(
  undefined
);

// props for provider
interface SessionsProviderProps {
  children: ReactNode;
  accessToken;
}

export const SessionsProvider: React.FC<SessionsProviderProps> = ({
  children,
  accessToken,
}) => {
  // State to hold the sessions
  const [allSessions, setAllSessions] = useState<Session[]>([]);

  // Example effect to fetch sessions (replace with your actual data fetching logic)
  useEffect(() => {
    const fetchSessions = async () => {
      // Fetch or initialize your sessions here
      // if the user is verified then get the instructor's sessions
      const sessionOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // Include the access token
        },
      };

      let sessionResponse = await fetch(
        `http://localhost:8000/api/instructor-sessions`,
        sessionOptions
      );
      const sessionData = await sessionResponse.json();
      const sessionsData = sessionData.sessions;
      const allSessions = sessionsData.sort((a, b) => {
        return (
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
      });
      setAllSessions(allSessions);
    };

    fetchSessions();
  }, [accessToken]);

  // Calculate upcoming sessions based on current time
  // upcomingSessions includes currently online sessions. checks by end time, not start time
  const upcomingSessions = allSessions.filter((session) => {
    const endTime = new Date(session.end_time);
    return endTime > new Date();
  });

  const getSessionStatus = (session) => {
    let status;
    const startDateWithBuffer = new Date(
      new Date(session.start_time).getTime() - 5 * 60000
    );
    const endDate = new Date(session.end_time);
    if (session.viewed && session.approved) status = "Confirmed";
    else if (session.viewed && !session.approved) status = "Canceled";
    else if (!session.viewed) status = "Pending";
    if (
      status === "Confirmed" &&
      isWithinInterval(new Date(), { start: startDateWithBuffer, end: endDate })
    ) {
      status = "Online";
    }
    return status;
  };

  return (
    <SessionsContext.Provider
      value={{ getSessionStatus, allSessions, upcomingSessions }}
    >
      {children}
    </SessionsContext.Provider>
  );
};

export const useSessions = (): SessionContextType => {
  const context = useContext(SessionsContext);
  if (context === undefined) {
    throw new Error("useSessions must be used within a SessionsProvider");
  }
  return context;
};
