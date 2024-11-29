import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { isWithinInterval } from "date-fns";
import { useRouter } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";
import { data } from "autoprefixer";
import { UUID } from "crypto";

interface UserProps {
    userRole: "ad" | "in" | "st";
}

interface ScheduledLesson {
    id: UUID;
    approved: boolean;
    start_time: string;
    end_time: string;
    learning_organization_location_id: number;
    max_capacity?: number;
    active_module?: number;
    lesson_plan_id?: UUID;
    admin_creator_id?: UUID;
    simple_id: number;
}


interface InstructorLessonScheduleContextType {
    type: "instructor";
    getLessonStatus: (lesson: ScheduledLesson) => any;
    allLessons: ScheduledLesson[];
    upcomingLessons: ScheduledLesson[];
    confirmLesson: (lessonId: UUID) => void;
    cancelLesson: (lessonId: UUID) => void;
    isLoading: boolean;
}

interface LearnerLessonScheduleContextType {
    type: "learner";
    getLessonStatus: (lesson: ScheduledLesson) => any;
    allLessons: ScheduledLesson[];
    upcomingLesson: ScheduledLesson[];
    enrollLesson: (lessonId: UUID) => void;
    waitlistLesson: (lessonId: UUID) => void;
    unenrollLesson: (lessonId: UUID) => void;
    unwaitlistLesson: (lessonId: UUID) => void;
    confirmLesson: (lessonId: UUID) => void;
    cancelLesson: (lessonId: UUID) => void;
    isLoading: boolean;
}

const supabase = createClient();

type LessonContextType = InstructorLessonScheduleContextType | LearnerLessonScheduleContextType;

const LessonsContext = createContext<LessonContextType | undefined>(
    undefined,
);

// props for provider
interface LessonScheduleProviderProps {
    children: ReactNode;
    accessToken: any;
    uid: UUID;
}

export const LessonScheduleProvider: React.FC<LessonScheduleProviderProps> = ({
    children,
    accessToken,
    uid,
}) => {
    const [allLessonSchedules, setAllLessonSchedules] = useState<ScheduledLesson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Function to fetch the organization name based on learning_organization_location_id
        const fetchOrganizationName = async (locationId: string) => {
            const { data: organization, error: orgError } = await supabase
                .from("heu_learningorganization")
                .select("name")
                .eq("id", parseInt(locationId, 10))
                .single();

            if (orgError) {
                console.error(
                    `fetchOrganizationName: Error fetching organization for location id ${locationId}:`,
                    orgError,
                );
            }

            return organization?.name || null;
        };

        // Function to fetch the location name based on learning_organization_location_id
        const fetchLocationName = async (locationId: string) => {
            const { data: location, error: locError } = await supabase
                .from("heu_learningorganizationlocation")
                .select("name")
                .eq("id", locationId)
                .single();

            if (locError) {
                console.error(
                    `fetchLocationName: Error fetching location for location id ${locationId}:`,
                    locError,
                );
                return null;
            }

            return location?.name || null;
        };

        const fetchLessons = async (filter: any) => {
            const { data: sessions, error } = await supabase
                .from("heu_session")
                .select("*")
                .eq("approved", true)
                .or(filter);

            if (error) {
                console.error("Error fetching sessions:", error);
                return [];
            }

            return sessions;
        };


        const processSessionDetails = async (session: ScheduledLesson, user_id) => {
            const organizationName = await fetchOrganizationName(
                session.learning_organization_location_id,
            );
            const locationName = await fetchLocationName(
                session.learning_organization_location_id,
            );

            return {
                id: session.id,
                start_time: session.start_time,
                end_time: session.end_time,
                organizationName,
                locationName,
            };
        };

    }

        const fetchLearnerLessons = async () => {
        console.log("FETCH LEARNER CALLED");

        const { data: lessons, error: lessonError } = await supabase
            .from("lesson_enrollments_new")
            .select("*")
            .eq("approved", true);

        /*start_time: lesson.start_time,
                    end_time: lesson.end_time,
                    total_max_capacity: lesson.total_max_capacity || 0,
                    num_enrolled: enrolled.length,
                    num_waitlist: waitlisted.length,
                    num_confirmed: confirmed.length,
                    learning_organization_name: organizationName,
                    location_name: locationName,
                    isEnrolled: enrolled.includes(user_id),
                    isWaitlisted: waitlisted.includes(user_id),
                    isConfirmed: confirmed.includes(user_id),
                    instructors: [...instructors],
                    id: lesson.id,
                };*/
        if (lessonError) {
            console.error("Error fetching lessons:", lessonError);
            setIsLoading(false);
            return;
        }
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        const user_id = user?.id;

        // Process all lessons and fetch corresponding organization and location names
        const allLessons = await Promise.all(
            lessons.map(async (lesson) => {
                const organizationName = await fetchOrganizationName(
                    lesson.learning_organization_location_id,
                );
                const locationName = await fetchLocationName(
                    lesson.learning_organization_location_id,
                );

                const enrolled = lesson.enrolled_students || [];
                const waitlisted = lesson.waitlist_students || [];
                const confirmed = lesson.confirmed_students || [];
                const instructors = lesson.confirmed_instructors || [];

                return {
                    start_time: lesson.start_time,
                    end_time: lesson.end_time,
                    total_max_capacity: lesson.total_max_capacity || 0,
                    num_enrolled: enrolled.length,
                    num_waitlist: waitlisted.length,
                    num_confirmed: confirmed.length,
                    learning_organization_name: organizationName,
                    location_name: locationName,
                    isEnrolled: enrolled.includes(user_id),
                    isWaitlisted: waitlisted.includes(user_id),
                    isConfirmed: confirmed.includes(user_id),
                    instructors: [...instructors],
                    id: lesson.id,
                };
            }),
        );

        // Sort lessons by start_time
        const sortedLessons = allSessions.sort((a, b) => {
            return (
                new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
            );
        });

        setAllSessions(sortedSessions);
        setIsLoading(false);
        console.log("Final sessions:", sortedSessions);
    };

    const fetchInstructorSessions = async () => {
        console.log("FETCH INSTRUCTOR CALLED");

        const {
            data: { session },
        } = await supabase.auth.getSession();
        const user_id = session?.user.id;

        // Fetch sessions where the instructor is involved (confirmed, pending, or canceled)
        const { data: sessions, error: sessionError } = await supabase
            .from("heu_session")
            .select("*")
            .eq("approved", true)
            .or(
                `pending_instructors.cs.{${user_id}},confirmed_instructors.cs.{${user_id}},canceled_instructors.cs.{${user_id}}`,
            );

        if (sessionError) {
            console.error("Error fetching instructor sessions:", sessionError);
            setIsLoading(false);
            return;
        }

        // Process all sessions and fetch corresponding organization and location names
        const allSessions = await Promise.all(
            sessions.map(async (session) => {
                const organizationName = await fetchOrganizationName(
                    session.learning_organization_location_id,
                );
                const locationName = await fetchLocationName(
                    session.learning_organization_location_id,
                );

                const enrolled = session.enrolled || [];
                const waitlisted = session.waitlisted || [];
                const confirmed = session.confirmed_instructors || [];

                // Get other instructor IDs by filtering out the current instructor ID
                const other_instructors = confirmed.filter(
                    (instructor: any) => instructor !== user_id,
                );

                // Determine the instructor status
                let instructor_status;
                if (session.confirmed_instructors.includes(user_id)) {
                    instructor_status = "confirmed";
                } else if (session.pending_instructors.includes(user_id)) {
                    instructor_status = "pending";
                } else if (session.canceled_instructors.includes(user_id)) {
                    instructor_status = "canceled";
                }

                return {
                    id: session.id,
                    start_time: session.start_time,
                    end_time: session.end_time,
                    max_capacity: session.max_capacity || 0,
                    num_enrolled: enrolled.length,
                    num_waitlist: waitlisted.length,
                    num_confirmed: confirmed.length,
                    learning_organization_name: organizationName,
                    location_name: locationName,
                    other_instructors: [...other_instructors],
                    instructor_status: instructor_status,
                };
            }),
        );

        // Sort sessions by start_time
        const sortedSessions = allSessions.sort((a, b) => {
            return (
                new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
            );
        });

        setAllSessions(sortedSessions);
        setIsLoading(false);
        console.log("Final instructor sessions:", sortedSessions);
    };

    // Call this function if the user is an instructor
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

// instructor session statuses: Confirmed, Online, Attended, Canceled
// learner session statuses: Available, Class full, Enrolled, Waitlisted, Confirmed, Online
const getSessionStatus = (session: any) => {
    if (userRole === "in") {
        const startDateWithBuffer = new Date(
            new Date(session.start_time).getTime() - 5 * 60000,
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
        const startDateWithBuffer = new Date(
            new Date(session.start_time).getTime() - 5 * 60000,
        );
        const endDate = new Date(session.end_time);
        if (endDate < new Date() && session.isConfirmed) {
            return "Attended";
        } else if (session.isEnrolled) return "Enrolled";
        else if (session.isWaitlisted) return "Waitlisted";
        else if (
            session.isConfirmed &&
            isWithinInterval(new Date(), {
                start: startDateWithBuffer,
                end: endDate,
            })
        ) {
            return "Online";
        } else if (session.isConfirmed) return "Confirmed";
        else if (session.num_enrolled < session.total_max_capacity)
            return "Available";
        else return "Class full";
    }
};

async function confirmSession(sessionId: string) {
    if (userRole === "in") {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const uuid = session?.user.id;

        try {
            const { data: session, error: sessionError } = await supabase
                .from("heu_sessions")
                .select("*")
                .eq("id", sessionId)
                .single();

            if (sessionError) throw sessionError;

            if (!session) {
                throw new Error("Session not found");
            }

            if (!session.approved) {
                throw new Error(
                    "This session is not approved for instructor assignment.",
                );
            }

            const { data: userInfo, error: userInfoError } = await supabase
                .from("user_roles")
                .select("*")
                .eq("user_id", uuid)
                .single();

            if (userInfoError) throw userInfoError;

            if (!userInfo || userInfo.role !== "in") {
                throw new Error("Only instructors can access this route");
            }

            // // Assuming you have these fields in your session table
            // let { data: updatedSession, error: updateError } = await supabase
            //   .from("sessions")
            //   .update({
            //     pending_instructors: supabase.raw(
            //       "array_remove(pending_instructors, ?)",
            //       [user.id],
            //     ),
            //     confirmed_instructors: supabase.raw(
            //       "array_append(confirmed_instructors, ?)",
            //       [user.id],
            //     ),
            //   })
            //   .eq("id", sessionId)
            //   .single();

            // if (updateError) throw updateError;

            return { message: "Successfully confirmed to teach this session" };
        } catch (error) {
            console.error(error);
            return;
        }
    } else if (userRole === "st") {
        await handleChange("confirm", sessionId);
    }
}

async function cancelSession(sessionId: string) {
    if (userRole === "in") {
        // not fixed yet
    } else if (userRole === "st") {
        await handleChange("cancel", sessionId);
    }
}

async function handleChange(taskString: any, sessionId: any) {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();
    const user_id = user?.id;

    const sessionIdInt = parseInt(sessionId, 10); // Convert to number if needed
    const userIdString = String(user_id); // Ensure user_id is a string

    switch (taskString) {
        case "enroll":
            try {
                const { data, error } = await supabase.rpc("add_student_to_session", {
                    p_session_id: sessionIdInt,
                    p_user_id: userIdString,
                });
            } catch (err) {
                console.error("Unexpected error:", err);
            }
            break;
        case "waitlist":
            try {
                const { data, error } = await supabase.rpc(
                    "add_student_to_waitlist",
                    {
                        p_session_id: sessionIdInt,
                        p_user_id: userIdString,
                    },
                );
            } catch (err) {
                console.error("Unexpected error:", err);
            }
            break;
        case "unenroll":
            try {
                const { data, error } = await supabase.rpc(
                    "remove_student_from_session",
                    {
                        p_session_id: sessionIdInt,
                        p_user_id: userIdString,
                    },
                );
            } catch (err) {
                console.error("Unexpected error:", err);
            }

            break;
        case "drop_waitlist":
            try {
                const { data, error } = await supabase.rpc(
                    "remove_student_from_waitlist",
                    {
                        p_session_id: sessionIdInt,
                        p_user_id: userIdString,
                    },
                );
            } catch (err) {
                console.error("Unexpected error:", err);
            }
            break;
        case "confirm":
            try {
                const { data, error } = await supabase.rpc(
                    "move_student_to_confirmed",
                    {
                        p_session_id: sessionIdInt,
                        p_user_id: userIdString,
                    },
                );
            } catch (err) {
                console.error("Unexpected error:", err);
            }
            break;
        case "cancel":
            try {
                const { data, error } = await supabase.rpc("add_student_to_session", {
                    p_session_id: sessionIdInt,
                    p_user_id: userIdString,
                });
            } catch (err) {
                console.error("Unexpected error:", err);
            }
            break;
        default:
            console.error(`Unknown task: ${taskString}`);
    }
}

async function enrollSession(sessionId: string) {
    await handleChange("enroll", sessionId);
}

async function waitlistSession(sessionId: string) {
    await handleChange("waitlist", sessionId);
}

async function unenrollSession(sessionId: string) {
    await handleChange("unenroll", sessionId);
}

async function unwaitlistSession(sessionId: string) {
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
            isLoading,
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
            isLoading,
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
            "useInstructorSessions must be used with an instructor role",
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
