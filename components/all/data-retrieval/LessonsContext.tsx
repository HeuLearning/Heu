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

interface UserProps {
    userRole: "ad" | "in" | "st";
}

interface Lesson {
    id: string; //
    start_time: string;//
    end_time: string;//
    max_capacity?: number;//
    total_max_capacity?: number;
    num_enrolled: number;//
    num_waitlist: number;//
    learning_organization_name: string;//?
    location_name: string;//?
    isEnrolled?: boolean;
    isWaitlisted?: boolean;
    instructors?: any[];
    other_instructors?: any[];
    instructor_status?: string;
}

// context type
interface InstructorLessonContextType {
    type: "instructor";
    getLessonStatus: (Lesson: Lesson) => any;
    allLessons: Lesson[];
    upcomingLessons: Lesson[];
    confirmLesson: (LessonId: string) => void;
    cancelLesson: (LessonId: string) => void;
    isLoading: boolean;
}

interface LearnerLessonContextType {
    type: "learner";
    getLessonStatus: (Lesson: Lesson) => any;
    allLessons: Lesson[];
    upcomingLessons: Lesson[];
    enrollLesson: (LessonId: string) => void;
    waitlistLesson: (LessonId: string) => void;
    unenrollLesson: (LessonId: string) => void;
    unwaitlistLesson: (LessonId: string) => void;
    confirmLesson: (LessonId: string) => void;
    cancelLesson: (LessonId: string) => void;
    isLoading: boolean;
}

const supabase = createClient();

type LessonContextType =
    | InstructorLessonContextType
    | LearnerLessonContextType;

// create context with initial undefined value
const LessonsContext = createContext<LessonContextType | undefined>(
    undefined,
);

// props for provider
interface LessonsProviderProps {
    children: ReactNode;
    accessToken: any;
    userRole: string;
}

export const LessonsProvider: React.FC<LessonsProviderProps> = ({
    children,
    accessToken,
    userRole,
}) => {
    // State to hold the Lessons
    const [allLessons, setAllLessons] = useState<Lesson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();


    // Example effect to fetch Lessons (replace with your actual data fetching logic)
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

        const fetchLearnerLessons = async () => {
            // Fetch or initialize your Lessons here
            const { data: Lessons, error: LessonError } = await supabase
                .from("heu_Lesson")
                .select("*")
                .eq("approved", true);

            if (LessonError) {
                console.error("Error fetching Lessons:", LessonError);
                setIsLoading(false);
                return;
            }
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();
            const user_id = user?.id;

            // Process all Lessons and fetch corresponding organization and location names
            const allLessons = await Promise.all(
                Lessons.map(async (Lesson) => {
                    const organizationName = await fetchOrganizationName(
                        Lesson.learning_organization_location_id,
                    );
                    const locationName = await fetchLocationName(
                        Lesson.learning_organization_location_id,
                    );

                    const enrolled = Lesson.enrolled_students || [];
                    const waitlisted = Lesson.waitlist_students || [];
                    const confirmed = Lesson.confirmed_students || [];
                    const instructors = Lesson.confirmed_instructors || [];

                    return {
                        start_time: Lesson.start_time,
                        end_time: Lesson.end_time,
                        total_max_capacity: Lesson.total_max_capacity || 0,
                        num_enrolled: enrolled.length,
                        num_waitlist: waitlisted.length,
                        learning_organization_name: organizationName,
                        location_name: locationName,
                        isEnrolled: enrolled.includes(user_id),
                        isWaitlisted: waitlisted.includes(user_id),
                        instructors: [...instructors],
                        id: Lesson.id,
                    };
                }),
            );

            // Sort Lessons by start_time
            const sortedLessons = allLessons.sort((a, b) => {
                return (
                    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
                );
            });

            setAllLessons(sortedLessons);
            setIsLoading(false);
            console.log("Final Lessons:", sortedLessons);
        };

        const fetchInstructorLessons = async () => {
            console.log("FETCH INSTRUCTOR CALLED");

            const {
                data: { session },
            } = await supabase.auth.getSession();
            const user_id = session?.user.id;

            // Fetch Lessons where the instructor is involved (confirmed, pending, or canceled)
            const { data: Lessons, error: LessonError } = await supabase
                .from("heu_Lesson")
                .select("*")
                .eq("approved", true)
                .or(
                    `pending_instructors.cs.{${user_id}},confirmed_instructors.cs.{${user_id}},canceled_instructors.cs.{${user_id}}`,
                );

            if (LessonError) {
                console.error("Error fetching instructor Lessons:", LessonError);
                setIsLoading(false);
                return;
            }

            // Process all Lessons and fetch corresponding organization and location names
            const allLessons = await Promise.all(
                Lessons.map(async (Lesson) => {
                    const organizationName = await fetchOrganizationName(
                        Lesson.learning_organization_location_id,
                    );
                    const locationName = await fetchLocationName(
                        Lesson.learning_organization_location_id,
                    );

                    const enrolled = Lesson.enrolled || [];
                    const waitlisted = Lesson.waitlisted || [];
                    const confirmed = Lesson.confirmed_instructors || [];

                    // Get other instructor IDs by filtering out the current instructor ID
                    const other_instructors = confirmed.filter(
                        (instructor: any) => instructor !== user_id,
                    );

                    // Determine the instructor status
                    let instructor_status;
                    if (Lesson.confirmed_instructors.includes(user_id)) {
                        instructor_status = "confirmed";
                    } else if (Lesson.pending_instructors.includes(user_id)) {
                        instructor_status = "pending";
                    } else if (Lesson.canceled_instructors.includes(user_id)) {
                        instructor_status = "canceled";
                    }

                    return {
                        id: Lesson.id,
                        start_time: Lesson.start_time,
                        end_time: Lesson.end_time,
                        max_capacity: Lesson.max_capacity || 0,
                        num_enrolled: enrolled.length,
                        num_waitlist: waitlisted.length,
                        learning_organization_name: organizationName,
                        location_name: locationName,
                        other_instructors: [...other_instructors],
                        instructor_status: instructor_status,
                    };
                }),
            );

            // Sort Lessons by start_time
            const sortedLessons = allLessons.sort((a, b) => {
                return (
                    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
                );
            });

            setAllLessons(sortedLessons);
            setIsLoading(false);
            console.log("Final instructor Lessons:", sortedLessons);
        };

        // Call this function if the user is an instructor
        if (userRole === "in") fetchInstructorLessons();
        else if (userRole === "st") fetchLearnerLessons();
    }, [accessToken]);

    // Calculate upcoming Lessons based on current time
    // upcomingLessons includes currently online Lessons. checks by end time, not start time
    const upcomingLessons = allLessons
        ? allLessons.filter((Lesson) => {
            const endTime = new Date(Lesson.end_time);
            return endTime > new Date();
        })
        : [];

    // instructor Lesson statuses: Confirmed, Online, Attended, Canceled
    // learner Lesson statuses: Available, Class full, Enrolled, Waitlisted, Confirmed, Online
    const getLessonStatus = (Lesson: any) => {
        if (userRole === "in") {
            const startDateWithBuffer = new Date(
                new Date(Lesson.start_time).getTime() - 5 * 60000,
            );
            const endDate = new Date(Lesson.end_time);
            let status =
                Lesson.instructor_status.charAt(0).toUpperCase() +
                Lesson.instructor_status.slice(1);
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
                new Date(Lesson.start_time).getTime() - 5 * 60000,
            );
            const endDate = new Date(Lesson.end_time);
            if (endDate < new Date()) {
                return "Attended";
            } else if (Lesson.isEnrolled) return "Enrolled";
            else if (Lesson.isWaitlisted) return "Waitlisted";
            else if (
                isWithinInterval(new Date(), {
                    start: startDateWithBuffer,
                    end: endDate,
                })
            ) {
                return "Online";
            }
            else if (Lesson.num_enrolled < Lesson.total_max_capacity)
                return "Available";
            else return "Class full";
        }
    };

    async function confirmLesson(LessonId: string) {
        if (userRole === "in") {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            const uuid = session?.user.id;

            try {
                const { data: Lesson, error: LessonError } = await supabase
                    .from("heu_Lessons")
                    .select("*")
                    .eq("id", LessonId)
                    .single();

                if (LessonError) throw LessonError;

                if (!Lesson) {
                    throw new Error("Lesson not found");
                }

                if (!Lesson.approved) {
                    throw new Error(
                        "This Lesson is not approved for instructor assignment.",
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

                // // Assuming you have these fields in your Lesson table
                // let { data: updatedLesson, error: updateError } = await supabase
                //   .from("Lessons")
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
                //   .eq("id", LessonId)
                //   .single();

                // if (updateError) throw updateError;

                return { message: "Successfully confirmed to teach this Lesson" };
            } catch (error) {
                console.error(error);
                return;
            }
        } else if (userRole === "st") {
            await handleChange("confirm", LessonId);
        }
    }

    async function cancelLesson(LessonId: string) {
        if (userRole === "in") {
            // not fixed yet
        } else if (userRole === "st") {
            await handleChange("cancel", LessonId);
        }
    }

    async function handleChange(taskString: any, LessonId: any) {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        const user_id = user?.id;

        const LessonIdInt = parseInt(LessonId, 10); // Convert to number if needed
        const userIdString = String(user_id); // Ensure user_id is a string

        switch (taskString) {
            case "enroll":
                try {
                    const { data, error } = await supabase.rpc("add_student_to_Lesson", {
                        p_Lesson_id: LessonIdInt,
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
                            p_Lesson_id: LessonIdInt,
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
                        "remove_student_from_Lesson",
                        {
                            p_Lesson_id: LessonIdInt,
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
                            p_Lesson_id: LessonIdInt,
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
                            p_Lesson_id: LessonIdInt,
                            p_user_id: userIdString,
                        },
                    );
                } catch (err) {
                    console.error("Unexpected error:", err);
                }
                break;
            case "cancel":
                try {
                    const { data, error } = await supabase.rpc("add_student_to_Lesson", {
                        p_Lesson_id: LessonIdInt,
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

    async function enrollLesson(LessonId: string) {
        await handleChange("enroll", LessonId);
    }

    async function waitlistLesson(LessonId: string) {
        await handleChange("waitlist", LessonId);
    }

    async function unenrollLesson(LessonId: string) {
        await handleChange("unenroll", LessonId);
    }

    async function unwaitlistLesson(LessonId: string) {
        await handleChange("drop_waitlist", LessonId);
    }

    const getContextValue = (): LessonContextType => {
        if (userRole === "in") {
            return {
                type: "instructor",
                getLessonStatus,
                allLessons,
                upcomingLessons,
                cancelLesson,
                confirmLesson,
                isLoading,
            };
        } else {
            return {
                type: "learner",
                allLessons,
                upcomingLessons,
                getLessonStatus,
                enrollLesson,
                waitlistLesson,
                unenrollLesson,
                unwaitlistLesson,
                confirmLesson,
                cancelLesson,
                isLoading,
            };
        }
    };

    return (
        <LessonsContext.Provider value={getContextValue()}>
            {children}
        </LessonsContext.Provider>
    );
};

export const useLessons = ():
    | InstructorLessonContextType
    | LearnerLessonContextType => {
    const context = useContext(LessonsContext);
    if (context === undefined) {
        throw new Error("useLessons must be used within a LessonsProvider");
    }
    return context;
};