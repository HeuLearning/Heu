import MiniClassBlock from "../MiniClassBlock";
import Divider from "../Divider";
import { useResponsive } from "../ResponsiveContext";
import HorizontalDatePicker from "./HorizontalDatePicker";
import { usePopUp } from "../popups/PopUpContext";
import MobileClassDetails from "./MobileClassDetails";
import { useLessons } from "../data-retrieval/LessonsContext";
import { useState, useEffect, useRef, useMemo } from "react";
import { LessonPlanProvider } from "../data-retrieval/LessonPlanContext";
import { isSameDay } from "date-fns";

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
    const { allLessons, upcomingLessons, getLessonStatus } = useLessons();
    const horizontalDatePickerRef = useRef<HTMLDivElement>(null);
    const [containerHeight, setContainerHeight] = useState(0);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

    let session;
    if (activeSessionId) {
        session = allLessons.find((session) => session.id === activeSessionId);
    }

    const closeClassDetails = () => {
        setActiveSessionId(null);
        hidePopUp("mobile-class-details-popup");
        setIsPopUpVisible(false);
    };

    useEffect(() => {
        if (isPopUpVisible) {
            updatePopUp(
                "mobile-class-details-popup",
                <LessonPlanProvider
                    sessionId={activeSessionId}
                    accessToken={accessToken}
                >
                    <MobileClassDetails
                        closeClassDetails={closeClassDetails}
                        activeSessionId={activeSessionId}
                    />
                </LessonPlanProvider>,
            );
        }
    }, [activeSessionId, isPopUpVisible, accessToken]);

    const handleMobileShowClassDetails = (sessionId: string) => {
        setIsPopUpVisible(true);
        showPopUp({
            id: "mobile-class-details-popup",
            content: (
                <LessonPlanProvider
                    sessionId={activeSessionId}
                    accessToken={accessToken}
                >
                    <MobileClassDetails
                        closeClassDetails={closeClassDetails}
                        activeSessionId={sessionId}
                    />
                </LessonPlanProvider>
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
        if (selectedDate)
            sessions = allLessons.filter((session) =>
                isSameDay(selectedDate, new Date(session.start_time)),
            );
        else sessions = upcomingLessons;
        return sessions?.map((session, index, filteredSessions) => {
            const currentDate = new Date(session.start_time);
            const currentDateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
            const previousDate =
                index > 0 ? new Date(filteredSessions[index - 1].start_time) : null;
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
                                index === 0 &&
                                upcomingLessons.length > 0 &&
                                filteredSessions[0].id === upcomingLessons[0].id
                            }
                            sessionId={session.id}
                            activeSessionId={activeSessionId}
                            setActiveSessionId={setActiveSessionId}
                            arrow={true}
                            handleMobileShowClassDetails={handleMobileShowClassDetails}
                        />
                    ) : (
                        <MiniClassBlock
                            dateCard={
                                index === 0 &&
                                upcomingLessons.length > 0 &&
                                filteredSessions[0].id === upcomingLessons[0].id
                            }
                            sessionId={session.id}
                            activeSessionId={activeSessionId}
                            setActiveSessionId={setActiveSessionId}
                            handleMobileShowClassDetails={handleMobileShowClassDetails}
                        />
                    )}
                </div>
            );
        });
    };

    // navbar = 64, containerHeight = horizontaldatepicker, border = 1
    const scrollContainerHeight = window.innerHeight - 64 - containerHeight - 1;

    const createSessionMap = () => {
        const sessionMap = new Map();
        allLessons.forEach((session) => {
            const startDate = new Date(session.start_time);
            const year = startDate.getFullYear();
            const month = startDate.getMonth();
            const day = startDate.getDate();
            // key in the map based on the session day online, not time
            const dateKey = `${year}-${month}-${day}`;
            const status = getLessonStatus(session);
            // circle color
            let color;
            if (status === "Canceled" || status === "Attended")
                color = "var(--typeface_tertiary)";
            else if (status === "Confirmed" || status === "Online")
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

    const sessionMap = useMemo(() => createSessionMap(), [allLessons]);

    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

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
