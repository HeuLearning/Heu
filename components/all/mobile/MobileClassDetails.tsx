import MobileDetailView from "./MobileDetailView";
import XButton from "../buttons/XButton";
import SessionDetailContent from "../SessionDetailContent";
import { useState, useEffect, useMemo, useTransition } from "react";
import { useResponsive } from "../ResponsiveContext";
import { useLessons } from "../data-retrieval/LessonsContext";
import ClassSchedulePopUpContainer from "../popups/ClassSchedulePopUpContent";
import BackButton from "../buttons/BackButton";
import { useLessonPlan } from "../data-retrieval/LessonPlanContext";
import ButtonBar from "./ButtonBar";
import MenuItem from "../buttons/MenuItem";
import { usePopUp } from "../popups/PopUpContext";
import { useRouter } from "next/navigation";
import dictionary from "@/dictionary";
import { getGT } from "gt-next";
import RSVPSelector from "../buttons/RSVPSelector";

interface MobileClassDetailsProps {
    activeSessionId: string | null;
    closeClassDetails: () => void;
}

export default function MobileClassDetails({
    activeSessionId,
    closeClassDetails,
}: MobileClassDetailsProps) {
    const { isMobile, isTablet, isDesktop } = useResponsive();
    const {
        allLessons,
        upcomingLessons,
        confirmLesson,
        cancelLesson,
        getLessonStatus,
    } = useLessons();
    const [isLessonPlanLoaded, setIsLessonPlanLoaded] = useState("loading");
    const [isClassSchedShown, setIsClassSchedShown] = useState(false);

    const t = getGT();

    const [isPending, startTransition] = useTransition();

    const router = useRouter();

    const { hidePopUp, showPopUp } = usePopUp();

    console.log("active session id" + activeSessionId);
    let lessonPlanData = useLessonPlan();
    const session = useMemo(() => {
        return activeSessionId
            ? allLessons.find((session) => session.id === activeSessionId)
            : null;
    }, [activeSessionId, allLessons]);

    const sessionStatus = useMemo(() => {
        return session ? getLessonStatus(session) : null;
    }, [session, getLessonStatus]);

    useEffect(() => {
        let newState = "loading";

        if (!session) {
            newState = "loading";
        } else if (sessionStatus === "Pending") {
            newState = "not confirmed instructor";
        } else if (sessionStatus === "Canceled") {
            newState = "canceled session";
        } else if (lessonPlanData.error === "lesson plan not found") {
            newState = "no lesson plan";
        } else if (
            !lessonPlanData.isLoading &&
            Object.keys(lessonPlanData.lessonPlan).length > 0
        ) {
            newState = "true";
        }

        if (newState !== isLessonPlanLoaded) {
            setIsLessonPlanLoaded(newState);
        }
    }, [session, sessionStatus, lessonPlanData, isLessonPlanLoaded]);

    const handleShowClassSchedule = () => {
        setIsClassSchedShown(true);
    };

    const hideClassSchedule = () => {
        setIsClassSchedShown(false);
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
                buttonBar={
                    session &&
                        (getLessonStatus(session) === "Pending" ||
                            getLessonStatus(session) === "Online")
                        ? true
                        : false
                }
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
                <div className="overflow-y-auto pt-[16px]">
                    <SessionDetailContent
                        lessonPlanData={lessonPlanData}
                        isLessonPlanLoaded={isLessonPlanLoaded}
                        activeSessionId={activeSessionId}
                        handleShowClassSchedule={handleShowClassSchedule}
                    />
                </div>

                <RSVPSelector session={session} shouldSpan={true} />
            </MobileDetailView>
            {!session ? (
                <div>loading</div>
            ) : (
                (getLessonStatus(session) === "Pending" ||
                    getLessonStatus(session) === "Online") && (
                    <div className="relative">
                        {session && getLessonStatus(session) === "Pending" ? (
                            <ButtonBar
                                primaryButtonText="RSVP"
                                primaryButtonOnClick={displayMobileRSVPOptions}
                            />
                        ) : getLessonStatus(session) === "Online" ? (
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
