import MiniClassBlock from "../MiniClassBlock";
import Divider from "../Divider";
import { useResponsive } from "../ResponsiveContext";
import HorizontalDatePicker from "./HorizontalDatePicker";
import { usePopUp } from "../popups/PopUpContext";
import MobileClassDetails from "./MobileClassDetails";
import { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { Lesson } from "@/types/lessons";  // Add import
import { isSameDay } from "date-fns";  // Add this import back

interface MobileDashboardProps {
    accessToken: string;
}

// this is equivalent to the web DashboardContainer + CalendarContainer, since the dashboard is simply the calendar
export default function MobileDashboard({
    accessToken,
}: MobileDashboardProps) {
    const { showPopUp, updatePopUp, hidePopUp } = usePopUp();
    const [isPopUpVisible, setIsPopUpVisible] = useState(false);
    const { isMobile, isTablet, isDesktop } = useResponsive();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();
    const horizontalDatePickerRef = useRef<HTMLDivElement>(null);
    const [containerHeight, setContainerHeight] = useState(0);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

    let session;
    if (activeSessionId) {
        session = lessons.find((session) => session.id === activeSessionId);
    }

    const closeClassDetails = () => {
        setActiveSessionId(null);
        hidePopUp("mobile-class-details-popup");
        setIsPopUpVisible(false);
    };

    const handleMobileShowClassDetails = (sessionId: string) => {
        setActiveSessionId(sessionId);
        setIsPopUpVisible(true);
        showPopUp({
            id: "mobile-class-details-popup",
            content: (
                <MobileClassDetails
                    closeClassDetails={closeClassDetails}
                    activeSessionId={sessionId}
                />
            ),
            container: null,
            style: {
                overlay: "overlay-high",
            },
            height: "100%",
        });
    };

    useEffect(() => {
        if (horizontalDatePickerRef.current) {
            setContainerHeight(
                horizontalDatePickerRef.current.getBoundingClientRect().height,
            );
        }
    }, []);

    const renderSessions = () => {
        let sessions;
        if (selectedDate) {
            sessions = lessons
                .filter((session) => isSameDay(selectedDate, new Date(session.start_time)))
                .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
        } else {
            sessions = [...lessons].sort((a, b) =>
                new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
            );
        }

        return sessions?.map((session, index, filteredSessions) => {
            const currentDate = new Date(session.start_time);
            const currentDateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
            const previousDate = index > 0 ? new Date(filteredSessions[index - 1].start_time) : null;
            const previousDateKey = previousDate
                ? `${previousDate.getFullYear()}-${previousDate.getMonth()}-${previousDate.getDate()}`
                : null;

            return (
                <div key={session.id}>
                    {index > 0 && index < filteredSessions.length && (
                        <Divider spacing={16} />
                    )}
                    {currentDateKey === previousDateKey ? (
                        <MiniClassBlock
                            dateCard={
                                index === 0 || currentDateKey !== previousDateKey
                            }
                            sessionId={session.id}
                            activeSessionId={activeSessionId}
                            setActiveSessionId={setActiveSessionId}
                            arrow={true}
                            handleMobileShowClassDetails={handleMobileShowClassDetails}
                            session={session}
                        />
                    ) : (
                        <MiniClassBlock
                            dateCard={
                                index === 0 || currentDateKey !== previousDateKey
                            }
                            sessionId={session.id}
                            activeSessionId={activeSessionId}
                            setActiveSessionId={setActiveSessionId}
                            handleMobileShowClassDetails={handleMobileShowClassDetails}
                            session={session}
                        />
                    )}
                </div>
            );
        });
    };

    // navbar = 64, containerHeight = horizontaldatepicker, border = 1
    const scrollContainerHeight = window.innerHeight - 64 - containerHeight - 1;

    const getLessonStatus = (lesson: Lesson) => {
        const now = new Date();
        const startTime = new Date(lesson.start_time);
        const endTime = new Date(lesson.end_time);

        if (now >= startTime && now <= endTime) return "Online";
        //if (lesson.confirmed_students?.includes(supabase.auth.getSession()?.user?.id)) return "Confirmed";
        // ... other status logic
        return "Pending";  // Default status
    };

    const createSessionMap = () => {
        const sessionMap = new Map();
        lessons.forEach((session) => {
            const startDate = new Date(session.start_time);
            const year = startDate.getFullYear();
            const month = startDate.getMonth();
            const day = startDate.getDate();
            // key in the map based on the session day online, not time
            const dateKey = `${year}-${month}-${day}`;
            const status = getLessonStatus(session);
            // circle color
            let color;
            /*  if (status === "Canceled" || status === "Attended")
                 color = "var(--typeface_tertiary)"; */
            if (/* status === "Confirmed" ||  */status === "Online")
                color = "var(--status_fg_positive)";
            else if (status === "Pending") color = "var(--typeface_primary)";
            if (sessionMap.get(dateKey)) {
                sessionMap.get(dateKey).push(color);
            } else {
                sessionMap.set(dateKey, new Array(color));
            }
        });
        return sessionMap;
    };

    const sessionMap = useMemo(() => createSessionMap(), [lessons]);

    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    useEffect(() => {
        const fetchLessons = async () => {
            const { data: lessons, error } = await supabase
                .from("lessons_new")
                .select("*");

            if (error) {
                console.error("Error fetching lessons:", error);
                return;
            }

            const processedLessons = lessons.map(lesson => ({
                ...lesson,
                learning_organization_name: "Heu Learning",
                location_name: "Online",
                num_enrolled: 80,
            }));

            setLessons(processedLessons);
            setIsLoading(false);
        };

        fetchLessons();
    }, []);

    return (
        <div
            className={`${isPopUpVisible ? "overflow-hidden" : ""
                } h-to-bottom w-screen rounded-t-[20px] border-[1px] border-surface_border_tertiary bg-surface_bg_highlight`}
        >
            {/* calendar */}
            <div ref={horizontalDatePickerRef}>
                <HorizontalDatePicker
                    sessionMap={sessionMap}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                />
            </div>

            {/* pop-up on select */}
            <div className="bg-surface_bg_tertiary">
                <div className="border-t-[1px] border-t-surface_bg_secondary"></div>
                <div
                    className={`sessions no-scrollbar overflow-y-auto px-[16px] pb-[32px] pt-[16px]`}
                    style={{ height: scrollContainerHeight }}
                >
                    {/* assumes that past sessions have been removed from array */}
                    {renderSessions()}
                </div>
            </div>
        </div>
    );
}
