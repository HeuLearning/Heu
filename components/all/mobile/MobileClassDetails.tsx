import MobileDetailView from "./MobileDetailView";
import XButton from "../buttons/XButton";
import SessionDetailContent from "../SessionDetailContent";
import { useState, useEffect, useMemo, useTransition } from "react";
import { useResponsive } from "../ResponsiveContext";
import ClassSchedulePopUpContainer from "../popups/ClassSchedulePopUpContent";
import BackButton from "../buttons/BackButton";
import ButtonBar from "./ButtonBar";
import MenuItem from "../buttons/MenuItem";
import { usePopUp } from "../popups/PopUpContext";
import { useRouter } from "next/navigation";
import dictionary from "@/dictionary";
import { getGT } from "gt-next";
import RSVPSelector from "../buttons/RSVPSelector";
import { createClient } from "@/utils/supabase/client";

interface MobileClassDetailsProps {
    activeSessionId: string | null;
    closeClassDetails: () => void;
}

export default function MobileClassDetails({
    activeSessionId,
    closeClassDetails,
}: MobileClassDetailsProps) {
    const { isMobile, isTablet, isDesktop } = useResponsive();
    const [session, setSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchSession = async () => {
        if (!activeSessionId) return;

        const { data, error } = await supabase
            .from("lessons_new")
            .select("*")
            .eq("id", activeSessionId)
            .single();

        if (data) {
            setSession(data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchSession();
    }, [activeSessionId]);

    const getLessonStatus = async () => {
        if (!session) return null;
        const now = new Date();
        const startTime = new Date(session.start_time);
        const endTime = new Date(session.end_time);

        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        if (now >= startTime && now <= endTime) return "Online";
        if (session.confirmed_students?.includes(userId)) return "Confirmed";
        return "Pending";
    };

    const [isLessonPlanLoaded, setIsLessonPlanLoaded] = useState("loading");
    const [isClassSchedShown, setIsClassSchedShown] = useState(false);

    const t = getGT();

    const [isPending, startTransition] = useTransition();

    const router = useRouter();

    const { hidePopUp, showPopUp } = usePopUp();

    console.log("active session id" + activeSessionId);
    const [lessonPlan, setLessonPlan] = useState<any>(null);
    const [lessonPlanLoading, setLessonPlanLoading] = useState(true);
    const [lessonPlanError, setLessonPlanError] = useState<any>(null);

    const fetchLessonPlan = async () => {
        if (!activeSessionId) return;
        setLessonPlanLoading(true);

        try {
            const { data, error } = await supabase
                .from('lesson_plans_new')
                .select('*')
                .eq('session_id', activeSessionId)
                .single();

            if (error) throw error;
            setLessonPlan(data);
        } catch (error) {
            setLessonPlanError(error);
        } finally {
            setLessonPlanLoading(false);
        }
    };

    useEffect(() => {
        fetchLessonPlan();
    }, [activeSessionId]);

    const lessonPlanData = {
        lessonPlan: lessonPlan,
        isLoading: lessonPlanLoading,
        error: lessonPlanError,
        phases: lessonPlan?.phases || [],
        getModules: (phaseId: string) =>
            lessonPlan?.phases?.find((p: { id: string }) => p.id === phaseId)?.modules || [],
        phaseTimes: new Map()
    };

    const [status, setStatus] = useState<string>("Pending");

    useEffect(() => {
        if (session && !isLoading) {
            getLessonStatus().then(result => {
                setStatus(result || "Pending");
            });
        }
    }, [session, isLoading]);

    useEffect(() => {
        let newState = "loading";

        if (!session) {
            newState = "loading";
        } else if (status === "Pending") {
            newState = "not confirmed instructor";
        } else if (status === "Canceled") {
            newState = "canceled session";
        } else if (lessonPlanError || !lessonPlan) {
            newState = "no lesson plan";
        } else if (!lessonPlanLoading && lessonPlan) {
            newState = "true";
        }

        if (newState !== isLessonPlanLoaded) {
            setIsLessonPlanLoaded(newState);
        }
    }, [session, status, lessonPlan, lessonPlanLoading, lessonPlanError]);

    const handleShowClassSchedule = () => {
        setIsClassSchedShown(true);
    };

    const hideClassSchedule = () => {
        setIsClassSchedShown(false);
    };

    const confirmLesson = async (sessionId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) return;

        const { error } = await supabase
            .from('lessons_new')
            .update({
                confirmed_students: [...(session.confirmed_students || []), user.id]
            })
            .eq('id', sessionId);

        if (!error) {
            // Refresh session data
            fetchSession();
        }
    };

    const handleConfirmAttendance = async (sessionId: string) => {
        await confirmLesson(sessionId);
        // Wait for the session status to update before reloading
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    const displayMobileRSVPOptions = () => {
        showPopUp({
            id: "mobile-confirm-attendance",
            // button bar 65 px + 8px
            content: (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => {
                            hidePopUp("mobile-confirm-attendance");
                        }}
                    />
                    <div className="fixed bottom-[73px] z-50 w-full p-[8px]">
                        <div className="flex w-full flex-col rounded-[10px] bg-surface_bg_highlight p-[4px]">
                            <MenuItem
                                onClick={
                                    session?.id
                                        ? () => handleConfirmAttendance(session?.id)
                                        : () => { }
                                }
                            >
                                {t("button_content.confirm_attendance")}
                            </MenuItem>
                            <MenuItem onClick={() => { }}>
                                {t("button_content.i_cant_attend")}
                            </MenuItem>
                        </div>
                    </div>
                </>
            ),
            container: null, // Ensure this ID exists in your DOM
            style: {
                overlay: "overlay-medium",
            },
            height: "auto",
        });
    };

    const handleEnterClass = () => {
        startTransition(() => {
            router.push(`${session?.id}`);
        });
    };

    return isClassSchedShown ? (
        <div>
            <div className="absolute inset-0 max-h-screen overflow-y-auto">
                <MobileDetailView
                    backgroundColor="bg-surface_bg_highlight"
                    className="px-[16px] pt-[16px]"
                    headerContent={
                        <div className="flex h-[44px] w-full items-center justify-center">
                            <BackButton
                                variation="button-secondary"
                                onClick={hideClassSchedule}
                                className="absolute left-0"
                            />
                            <h3 className="text-typeface_primary text-body-medium">
                                {t("session_detail_content.class_schedule")}
                            </h3>
                        </div>
                    }
                >
                    <ClassSchedulePopUpContainer
                        {...{
                            ...lessonPlanData,
                            getModules: (phaseId: string) =>
                                lessonPlanData.getModules(phaseId) || [], // Return an empty array if undefined
                        }}
                    />
                </MobileDetailView>
            </div>
        </div>
    ) : (
        <div className="absolute inset-0 max-h-screen overflow-y-auto">
            <MobileDetailView
                buttonBar={session && (status === "Pending" || status === "Online")}
                backgroundColor="bg-surface_bg_highlight"
                className="px-[16px] pt-[16px]"
                headerContent={
                    <div className="rits fine uelative flex h-[44px] w-full items-center justify-center">
                        <h3 className="text-typeface_primary text-body-medium-mobile">
                            {t("class_mode_content.class_details")}
                        </h3>
                        <XButton
                            variation="button-secondary"
                            onClick={() => closeClassDetails()}
                            className="absolute right-0"
                        />
                    </div>
                }
            >
                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    <div className="overflow-y-auto pt-[16px]">
                        <SessionDetailContent
                            activeSessionId={activeSessionId}
                            handleShowClassSchedule={handleShowClassSchedule}
                        />
                    </div>
                )}
                {!isLoading && <RSVPSelector session={session} shouldSpan={true} />}
            </MobileDetailView>
            {!session ? (
                <div>loading</div>
            ) : (
                (status === "Pending" || status === "Online") && (
                    <div className="relative">
                        {session && status === "Pending" ? (
                            <ButtonBar
                                primaryButtonText="RSVP"
                                primaryButtonOnClick={displayMobileRSVPOptions}
                            />
                        ) : status === "Online" ? (
                            <div>
                                <ButtonBar
                                    primaryButtonText={t("button_content.enter_class")}
                                    primaryButtonOnClick={handleEnterClass}
                                    primaryButtonDisabled={isPending}
                                />
                            </div>
                        ) : null}
                    </div>
                )
            )}
        </div>
    );
}
