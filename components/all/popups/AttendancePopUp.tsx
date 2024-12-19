import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { usePopUp } from "./PopUpContext";
import { getGT } from "gt-next";
import { format } from "date-fns";
import DateCard from "../DateCard";
import PopUpContainer from "./PopUpContainer";
import styles from "../MiniClassBlock.module.css";
import { useResponsive } from "../ResponsiveContext";
import { Lesson } from "@/types/lessons";

// Define the types for session and props
/* interface Session {
    id: string;
    start_time: string; // Use string for ISO format
    end_time: string; // Use string for ISO format
    total_max_capacity?: number;
    confirmed_students: string[];
    enrolled_students: string[];
    waitlist_students: string[];
    canceled_students: string[];
    // Add any other relevant properties if needed
} */

interface AttendancePopUpProps {
    session: Lesson;
    action: "confirm" | "can't attend" | "enroll" | "rsvp" | "waitlist";
    popUpId: string;
}

export default function AttendancePopUp({ session, action, popUpId }: AttendancePopUpProps) {
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();
    const { hidePopUp } = usePopUp();
    const t = getGT();
    const { isMobile } = useResponsive();

    const handleConfirm = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) return;

        // Commented out until types are properly defined
        /* const { error } = await supabase
            .from('lessons_new')
            .update({
                confirmed_students: [...(session.confirmed_students || []), user.id]
            })
            .eq('id', session.id); */

        // Temporary no-op
        const error = null;

        if (!error) {
            hidePopUp(popUpId);
            window.location.reload(); // Refresh to show updated status
        }
        setIsLoading(false);
    };

    const handleCantAttend = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) return;

        const { error } = await supabase
            .from('lessons_new')
            .update({
                // canceled_students: [...(session.canceled_students || []), user.id],
                // enrolled_students: (session.enrolled_students || []).filter(id => id !== user.id)
            })
            .eq('id', session.id);

        if (!error) {
            hidePopUp(popUpId);
            window.location.reload();
        }
        setIsLoading(false);
    };

    const startDate = new Date(session.start_time);

    if (action === "enroll" || action === "waitlist") {
        const handleEnrollSession = async () => {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.id) return;

            const { error } = await supabase
                .from('lessons_new')
                .update({
                    // enrolled_students: [...(session.enrolled_students || []), user.id]
                })
                .eq('id', session.id);

            if (!error) {
                hidePopUp(popUpId);
                window.location.reload();
            }
            setIsLoading(false);
        };

        const handleWaitlistSession = async () => {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.id) return;

            const { error } = await supabase
                .from('lessons_new')
                .update({
                    // waitlist_students: [...(session.waitlist_students || []), user.id]
                })
                .eq('id', session.id);

            if (!error) {
                hidePopUp(popUpId);
                window.location.reload();
            }
            setIsLoading(false);
        };

        return (
            <PopUpContainer
                header={action === "enroll" ? "Enroll in this class" : "Join waiting list"}
                primaryButtonText={action === "enroll" ? "Enroll" : "Join waiting list"}
                secondaryButtonText="Cancel"
                primaryButtonOnClick={
                    action === "enroll"
                        ? handleEnrollSession
                        : handleWaitlistSession
                }
                secondaryButtonOnClick={() => hidePopUp(popUpId)}
                popUpId={popUpId}
            >
                <p className="text-typeface_primary text-body-regular">
                    {action === "enroll"
                        ? "Are you sure you'd like to add this class to your schedule?"
                        : "This class is currently full. Upon joining the waiting list, if a spot becomes available, we'll notify you for you to confirm your attendance."}
                </p>
                {!isMobile && ( // Conditionally render details for non-mobile devices
                    <div className="relative pt-[32px]">
                        <div className={`${styles.confirm_class_block} flex w-full items-center rounded-[14px]`}>
                            <DateCard
                                month={startDate.toLocaleDateString("default", { month: "short" })}
                                day={startDate.toLocaleDateString("default", { day: "numeric" })}
                            />
                            <div className="flex items-center justify-between px-[8px]">
                                <div className="flex gap-[4px] pl-[4px]">
                                    <h1 className="text-typeface_primary text-body-semibold">
                                        {startDate.toLocaleDateString("default", { weekday: "long" })}
                                    </h1>
                                    <h1 className="text-typeface_secondary text-body-medium">
                                        {`${startDate.toLocaleTimeString("default", { hour: "numeric", minute: "2-digit", hour12: undefined })} - ${new Date(session.end_time).toLocaleTimeString("default", { hour: "numeric", minute: "2-digit", hour12: undefined })}`}
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </PopUpContainer>
        );
    }

    return (
        <PopUpContainer
            header={action === "confirm" ? "Confirm attendance" : "I can't attend"}
            primaryButtonText={action === "confirm" ? "Confirm" : "I can't attend"}
            secondaryButtonText={action === "confirm" ? "Cancel" : "Swap class"}
            primaryButtonOnClick={
                action === "confirm"
                    ? () => handleConfirm()
                    : () => handleCantAttend()
            }
            secondaryButtonOnClick={action === "confirm" ? () => hidePopUp(popUpId) : () => { }}
            popUpId={popUpId}
        >
            <p className="text-typeface_primary text-body-regular">
                {`Would you like to ${action === "confirm" ? "confirm" : "cancel"} attendance to the following class?`}
            </p>
            {!isMobile && ( // Conditionally render details for non-mobile devices
                <div className="relative pt-[32px]">
                    <div className={`${styles.confirm_class_block} flex w-full items-center rounded-[14px]`}>
                        <DateCard
                            month={startDate.toLocaleDateString("default", { month: "short" })}
                            day={startDate.toLocaleDateString("default", { day: "numeric" })}
                        />
                        <div className="flex items-center justify-between px-[8px]">
                            <div className="flex gap-[4px] pl-[4px]">
                                <h1 className="text-typeface_primary text-body-semibold">
                                    {startDate.toLocaleDateString("default", { weekday: "long" })}
                                </h1>
                                <h1 className="text-typeface_secondary text-body-medium">
                                    {`${startDate.toLocaleTimeString("default", { hour: "numeric", minute: "2-digit", hour12: undefined })} - ${new Date(session.end_time).toLocaleTimeString("default", { hour: "numeric", minute: "2-digit", hour12: undefined })}`}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PopUpContainer>
    );
}
