import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import InfoPill from "./InfoPill";
import Button from "./buttons/Button";
import InfoCard from "./InfoCard";
import ClassItem from "./ClassItem";
import ClassStats from "./ClassStats";
import Placeholder from "./Placeholder";
import { useResponsive } from "./ResponsiveContext";
import { format, differenceInMilliseconds } from "date-fns";
import RSVPSelector from "./buttons/RSVPSelector";
import IconButton from "./buttons/IconButton";
import { useUserRole } from "./data-retrieval/UserRoleContext";
import AttendancePopUp from "./popups/AttendancePopUp";
import { usePopUp } from "./popups/PopUpContext";
import dictionary from "../../dictionary.js";
import { getGT } from "gt-next";
import { useTransition } from "react";

interface SessionDetailContentProps {
    activeSessionId: string | null;
    handleShowClassSchedule: () => void;
}

export default function SessionDetailContent({
    activeSessionId,
    handleShowClassSchedule,
}: SessionDetailContentProps) {
    const [session, setSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState<string>("Available");
    const supabase = createClient();
    const router = useRouter();
    const { isMobile, isTablet, isDesktop } = useResponsive();
    const { showPopUp, hidePopUp } = usePopUp();
    const { userRole } = useUserRole();
    const [isPending, startTransition] = useTransition();
    const t = getGT();
    const [lessonPlan, setLessonPlan] = useState<any>(null);
    const [lessonPlanLoading, setLessonPlanLoading] = useState<string>("loading");
    const [lessonPlanError, setLessonPlanError] = useState<any>(null);

    const getLessonStatus = async () => {
        if (!session) return null;
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        const now = new Date();
        const startTime = new Date(session.start_time);
        const endTime = new Date(session.end_time);

        if (now >= startTime && now <= endTime) return "Online";
        if (session.confirmed_students?.includes(userId)) return "Confirmed";
        if (session.enrolled_students?.includes(userId)) return "Enrolled";
        return "Pending";
    };

    const fetchSession = async () => {
        if (!activeSessionId) return;
        console.log("Fetching session data for:", activeSessionId);
        setIsLoading(true);

        try {
            const { data, error } = await supabase
                .from("lessons_new")
                .select('*')
                .eq("id", activeSessionId)
                .single();

            console.log("Session data received:", data);
            if (error) throw error;

            if (data) {
                setSession({
                    ...data,
                    learning_organization: { name: "Heu Learning" },
                    location: { name: "Online" },
                    num_enrolled: 80,
                    max_capacity: data.max_capacity
                });
            } else {
                console.error("No data received for session");
            }
        } catch (error) {
            console.error("Error fetching session:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLessonPlan = async () => {
        if (!activeSessionId) return;
        setLessonPlanLoading("loading");

        try {
            const { data, error } = await supabase
                .from('lesson_plans_new')
                .select('*')
                .eq('session_id', activeSessionId)
                .single();

            if (error) throw error;
            setLessonPlan(data);
            setLessonPlanLoading("loaded");
        } catch (error) {
            setLessonPlanError(error);
            setLessonPlanLoading("error");
        }
    };

    useEffect(() => {
        console.log("Fetching session...");
        console.log("activeSessionId:", activeSessionId);
        fetchSession();
    }, [activeSessionId]);

    useEffect(() => {
        fetchLessonPlan();
    }, [activeSessionId]);

    useEffect(() => {
        if (session) {
            getLessonStatus().then(result => {
                setStatus(result || "Available");
            });
        }
    }, [session]);

    const handleEnter = () => {
        router.push(`${activeSessionId}`);
    };

    if (isLoading || lessonPlanLoading === "loading" || !session) {
        console.log("Still loading:", {
            isLoading,
            lessonPlanLoading,
            hasSession: !!session
        });
        return <div>Loading session details...</div>;
    }

    const differenceInDaysToStart = Math.round(
        differenceInMilliseconds(new Date(session.start_time), new Date()) / (24 * 60 * 60 * 1000),
    );
    const isUpcoming = differenceInDaysToStart < 14 && new Date(session.end_time) > new Date();

    const showEnrollPopUp = () => {
        showPopUp({
            id: "enroll-session-poup",
            content: (
                <AttendancePopUp
                    session={session}
                    action="enroll"
                    popUpId="enroll-session-poup"
                />
            ),
            container: null, // Ensure this ID exists in your DOM
            style: {
                overlay: "overlay-high",
            },
            height: "276px",
        });
    };

    const showWaitingListPopUp = () => {
        showPopUp({
            id: "waitlist-session-poup",
            content: (
                <AttendancePopUp
                    session={session}
                    action="waitlist"
                    popUpId="waitlist-session-poup"
                />
            ),
            container: null, // Ensure this ID exists in your DOM
            style: {
                overlay: "overlay-high",
            },
            height: "276px",
        });
    };

    const getActionItem = () => {
        if (isMobile) return null;
        /* else {
            if (session) {
                if (userRole === "in") {
                    if (
                        status === "Canceled" ||
                        status === "Confirmed" ||
                        status === "Attended"
                    ) {
                        return <RSVPSelector session={session} />;
                    } else if (status === "Online") {
                        return (
                            <Button
                                className="button-primary"
                                onClick={() =>
                                    startTransition(() => {
                                        handleEnter();
                                    })
                                }
                                disabled={isPending}
                            >
                                {t("button_content.enter_class")}
                            </Button>
                        );
                    } else if (
                        new Date(session.end_time) < new Date() &&
                        status !== "Attended"
                    ) {
                        // if session was in the past and was not attended
                        return null;
                    } else if (differenceInDaysToStart < 7) {
                        return <RSVPSelector session={session} />;
                    } else return null;
                } else if (userRole === "st") {
                    console.log("session status", status);
                    if (status === "Available") {
                        return (
                            <Button className="button-primary" onClick={showEnrollPopUp}>
                                {t("button_content.enroll")}
                            </Button>
                        );
                    } else if (status === "Online") {
                        return (
                            <Button
                                className="button-primary"
                                onClick={() =>
                                    startTransition(() => {
                                        handleEnter();
                                    })
                                }
                                disabled={isPending}
                            >
                                {t("button_content.enter_class")}
                            </Button>
                        );
                    } else if (status === "Class full") {
                        return (
                            <Button className="button-primary" onClick={showWaitingListPopUp}>
                                {t("button_content.join_waiting_list")}
                            </Button>
                        );
                    } else if (
                        (status === "Enrolled" &&
                            differenceInDaysToStart < 7) ||
                        status === "Confirmed" ||
                        status === "Canceled"
                    ) {
                        return <RSVPSelector session={session} />;
                    } else if (status === "Waitlisted") {
                        // no action if waitilisted, but info pill different
                        // doesn't do anything for now, fix later
                        return (
                            <Button className="button-primary" onClick={() => { }}>
                                {t("button_content.leave_waiting_list")}
                            </Button>
                        );
                    }
                }
            }
        } */
    };

    const enrollLesson = async (sessionId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) return;

        // Commented out until types are properly defined
        /* const { error } = await supabase
            .from('lessons_new')
            .update({
                enrolled_students: [...(session.enrolled_students || []), user.id]
            })
            .eq('id', sessionId); */

        // Temporary no-op
        const error = null;

        if (!error) {
            fetchSession();
        }
    };

    const lessonPlanData = {
        lessonPlan: lessonPlan || {},
        isLoading: lessonPlanLoading,
        error: lessonPlanError,
        phases: lessonPlan?.phases || [],
        getModules: (phaseId: string) =>
            lessonPlan?.phases?.find((p: { id: string }) => p.id === phaseId)?.modules || [],
        phaseTimes: new Map()
    };

    return (
        <div
            id="session-detail-view"
            className={`${isMobile ? "gap-[24px]" : "justify-between"
                } relative flex h-full w-full flex-col`}
        >
            <div
                className={`session-info flex items-start justify-between ${isMobile ? "flex-col gap-[12px] px-[8px]" : ""
                    }`}
            >
                <div className="session-title space-y-[16px]">
                    <div className="date-title space-y-[10px]">
                        {activeSessionId ? (
                            isMobile ? (
                                <h1 className="text-typeface_primary leading-cap-height text-h1">
                                    {new Date(session.start_time).toLocaleDateString("default", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </h1>
                            ) : (
                                <h1 className="text-typeface_primary leading-cap-height text-h1">
                                    {new Date(session.start_time).toLocaleDateString("default", {
                                        weekday: "long",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </h1>
                            )
                        ) : (
                            <Placeholder width={244} height={16} />
                        )}
                        {activeSessionId ? (
                            <h1 className="text-typeface_secondary leading-tight text-h1">
                                {new Date(session.start_time).toLocaleTimeString("default", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: undefined,
                                }) +
                                    " - " +
                                    new Date(session.end_time).toLocaleTimeString("default", {
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: undefined,
                                    })}
                            </h1>
                        ) : (
                            <Placeholder width={208} height={16} />
                        )}
                    </div>
                    <div className="flex items-center gap-[12px]">
                        <div className="flex items-center">
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0.8 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M5.87305 4.21729C5.87305 3.8234 5.96794 3.46533 6.15771 3.14307C6.34749 2.8208 6.60173 2.56478 6.92041 2.375C7.24268 2.18164 7.60075 2.08496 7.99463 2.08496C8.39209 2.08496 8.75016 2.18164 9.06885 2.375C9.39111 2.56478 9.64714 2.8208 9.83691 3.14307C10.0267 3.46533 10.1216 3.8234 10.1216 4.21729C10.1216 4.54313 10.0535 4.84749 9.91748 5.13037C9.78141 5.40967 9.59521 5.64958 9.35889 5.8501C9.12256 6.05062 8.85579 6.19027 8.55859 6.26904V11.3179C8.55859 11.6867 8.5389 12.0161 8.49951 12.3062C8.4637 12.5962 8.41715 12.8433 8.35986 13.0474C8.30257 13.255 8.23991 13.4126 8.17188 13.52C8.10742 13.6274 8.04834 13.6812 7.99463 13.6812C7.94092 13.6812 7.88184 13.6257 7.81738 13.5146C7.75293 13.4072 7.69027 13.2515 7.62939 13.0474C7.5721 12.8433 7.52376 12.5962 7.48438 12.3062C7.44857 12.0161 7.43066 11.6867 7.43066 11.3179V6.26904C7.12988 6.18669 6.86133 6.04704 6.625 5.8501C6.39225 5.64958 6.20785 5.40967 6.07178 5.13037C5.93929 4.84749 5.87305 4.54313 5.87305 4.21729ZM7.3877 4.33545C7.58822 4.33545 7.76009 4.26383 7.90332 4.12061C8.04655 3.9738 8.11816 3.80192 8.11816 3.60498C8.11816 3.40804 8.04655 3.23796 7.90332 3.09473C7.76009 2.9515 7.58822 2.87988 7.3877 2.87988C7.19434 2.87988 7.02425 2.9515 6.87744 3.09473C6.73421 3.23796 6.6626 3.40804 6.6626 3.60498C6.6626 3.80192 6.73421 3.9738 6.87744 4.12061C7.02425 4.26383 7.19434 4.33545 7.3877 4.33545Z"
                                    fill={
                                        activeSessionId
                                            ? "var(--typeface_primary)"
                                            : "var(--surface_bg_secondary)"
                                    }
                                />
                            </svg>
                            <p className="text-typeface_primary text-body-medium">
                                {activeSessionId ? (
                                    session.learning_organization?.name +
                                    ", " +
                                    session.location?.name
                                ) : (
                                    <Placeholder width={144} height={10} />
                                )}
                            </p>
                        </div>
                        <p className="text-typeface_secondary text-body-regular">
                            {activeSessionId ? (
                                "Room #"
                            ) : (
                                <Placeholder width={64} height={10} />
                            )}
                        </p>
                        {isMobile ? null : (
                            <Button className="button-secondary" disabled={!activeSessionId}>
                                {t("button_content.get_directions")}
                            </Button>
                        )}
                    </div>
                </div>
                <div className="session-buttons flex items-center gap-[16px] pr-[14px]">
                    {activeSessionId &&
                        (status === "Online" ? (
                            <InfoPill
                                icon={true}
                                text={t("info_pill_content.class_started")}
                            />
                        ) : userRole === "in" &&
                            status !== "Canceled" &&
                            isUpcoming ? (
                            <InfoPill
                                icon={true}
                                text={
                                    differenceInDaysToStart === 0
                                        ? "Starts today"
                                        : `Starts in ${differenceInDaysToStart} day${differenceInDaysToStart > 1 ? "s" : ""
                                        }`
                                }
                            />
                        ) : userRole === "st" &&
                            status === "Waitlisted" ? (
                            <InfoPill icon={true} text={t("info_pill_content.waitlisted")} />
                        ) : null)}
                    {getActionItem()}
                </div>
            </div>
            <div
                className={`session_cards flex flex-col ${isMobile ? "gap-[24px]" : "gap-[16px]"
                    } `}
            >
                <InfoCard className={`stat-info-card`}>
                    <div className="p-[4px]">
                        {activeSessionId ? (
                            <ClassStats
                                session={session}
                                level="C1"
                                agenda="Target"
                                classCode="7FJR92"
                                isMobile={isMobile}
                            />
                        ) : (
                            <ClassStats
                                session={{ num_enrolled: 0, max_capacity: 120 }}
                                level="-"
                                agenda="-"
                                classCode="-"
                            />
                        )}
                    </div>
                </InfoCard>
                <div
                    className={`${isMobile
                        ? "flex flex-col gap-[24px]"
                        : "grid h-full min-h-[358px] w-full min-w-full flex-grow grid-cols-5 gap-[16px]"
                        }`}
                >
                    <div className={`${isMobile ? "" : "col-span-2 h-full w-full"}`}>
                        <InfoCard className="overview-card h-full min-h-[300px] flex-grow">
                            <div
                                className={`flex flex-col ${isMobile ? "gap-[21px]" : "gap-[24px]"
                                    }`}
                            >
                                <h1
                                    className={`text-typeface_primary ${isMobile ? "text-body-semibold" : "text-h3"
                                        }`}
                                >
                                    {t("session_detail_content.overview")}
                                </h1>
                                <p
                                    className={`${isMobile
                                        ? "text-typeface_primary"
                                        : "text-typeface_secondary"
                                        } text-body-regular`}
                                >
                                    {activeSessionId ? (
                                        "Plan and deliver engaging lessons that integrate listening, speaking, reading, and writing activities, tailored to students' proficiency levels, and include clear objectives, interactive exercises, and regular assessments to monitor progress."
                                    ) : (
                                        <div className="flex flex-col gap-[14px]">
                                            <Placeholder width={252} height={10} />
                                            <Placeholder width={244} height={10} />
                                            <Placeholder width={272} height={10} />
                                            <Placeholder width={252} height={10} />
                                            <Placeholder width={286} height={10} />
                                            <Placeholder width={200} height={10} />
                                        </div>
                                    )}
                                </p>
                            </div>
                        </InfoCard>
                    </div>
                    <div
                        className={`${isMobile ? "" : "col-span-3 h-full w-full flex-grow"
                            }`}
                    >
                        <InfoCard
                            className={`class-lineup-card h-full min-h-[300px] flex-grow ${!activeSessionId ||
                                (activeSessionId &&
                                    (lessonPlanLoading === "loading" ||
                                        lessonPlanLoading === "not confirmed instructor" ||
                                        lessonPlanLoading === "canceled session" ||
                                        lessonPlanLoading === "no lesson plan"))
                                ? ""
                                : "cursor-pointer"
                                }`}
                            onClick={
                                (!activeSessionId ||
                                    (activeSessionId &&
                                        (lessonPlanLoading === "loading" ||
                                            lessonPlanLoading === "not confirmed instructor" ||
                                            lessonPlanLoading === "canceled session" ||
                                            lessonPlanLoading === "no lesson plan" ||
                                            lessonPlanError
                                        ))) ? undefined : handleShowClassSchedule
                            }
                        >
                            <div className="flex flex-col gap-[24px]">
                                <div className="flex items-center justify-between">
                                    <h1
                                        className={`text-typeface_primary ${isMobile ? "text-body-semibold" : "text-h3"
                                            }`}
                                    >
                                        {t("session_detail_content.class_schedule")}
                                    </h1>
                                    <IconButton
                                        className={`${isMobile ? "h-[32px] w-[32px]" : ""
                                            } outline-surface_border_tertiary`}
                                        disabled={Boolean(
                                            !activeSessionId ||
                                            (activeSessionId &&
                                                (lessonPlanLoading === "loading" ||
                                                    lessonPlanLoading === "not confirmed instructor" ||
                                                    lessonPlanLoading === "canceled session" ||
                                                    lessonPlanLoading === "no lesson plan" ||
                                                    lessonPlanError
                                                )),
                                        )}
                                    >
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M6.5 11.25L10 7.75L6.5 4.25"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </IconButton>
                                </div>
                                {activeSessionId && lessonPlanLoading !== "loading" ? (
                                    lessonPlanLoading === "not confirmed instructor" ? (
                                        <div className="text-typeface_primary text-body-medium">
                                            You cannot see the lesson plan until you've confirmed the
                                            session.
                                        </div>
                                    ) : lessonPlanLoading === "canceled session" ? (
                                        <div className="text-typeface_primary text-body-medium">
                                            This session was canceled.
                                        </div>
                                    ) : lessonPlanLoading === "no lesson plan" || !lessonPlan || lessonPlanError ? (
                                        <div className="flex flex-col gap-[26px]">
                                            {Array.from({ length: 3 }).map((_, index) => (
                                                <div key={index} className="flex justify-between">
                                                    <Placeholder width={160} height={10} />
                                                    <Placeholder width={88} height={10} />
                                                </div>
                                            ))}
                                            <div className="flex justify-between">
                                                <Placeholder width={44} height={10} />
                                                <Placeholder width={44} height={10} />
                                            </div>
                                            {Array.from({ length: 2 }).map((_, index) => (
                                                <div key={index} className="flex justify-between">
                                                    <Placeholder width={160} height={10} />
                                                    <Placeholder width={88} height={10} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-[19px]">
                                            {lessonPlan?.phases?.map((phase: any) => (
                                                <ClassItem
                                                    key={phase.id}
                                                    phaseTitle={phase.name}
                                                    time={lessonPlanData.phaseTimes.get(phase.id)}
                                                />
                                            ))}
                                        </div>
                                    )
                                ) : (
                                    <div className="flex flex-col gap-[26px]">
                                        {Array.from({ length: 3 }).map((_, index) => (
                                            <div key={index} className="flex justify-between">
                                                <Placeholder width={160} height={10} />
                                                <Placeholder width={88} height={10} />
                                            </div>
                                        ))}
                                        <div className="flex justify-between">
                                            <Placeholder width={44} height={10} />
                                            <Placeholder width={44} height={10} />
                                        </div>
                                        {Array.from({ length: 2 }).map((_, index) => (
                                            <div key={index} className="flex justify-between">
                                                <Placeholder width={160} height={10} />
                                                <Placeholder width={88} height={10} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </InfoCard>
                    </div>
                </div>
            </div>
        </div>
    );
}
