import MobileDetailView from "./MobileDetailView";
import XButton from "../XButton";
import SessionDetailContent from "../SessionDetailContent";
import { useState, useEffect, useRef } from "react";
import { useResponsive } from "../ResponsiveContext";
import { useSessions } from "../SessionsContext";
import { format } from "date-fns";
import ClassSchedulePopUpContainer from "../ClassSchedulePopUpContent";
import BackButton from "../BackButton";

export default function MobileClassDetails({
  activeSessionId,
  activeSessionByDate,
  closeClassDetails,
}) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { upcomingSessions } = useSessions();
  const [isClassSchedShown, setIsClassSchedShown] = useState(false);

  let session;
  let startDate;
  let endDate;
  if (activeSessionId) {
    session = upcomingSessions.find(
      (session) => session.id === activeSessionId
    );
    startDate = new Date(session.start_time);
    endDate = new Date(session.end_time);
  }

  const handleShowClassSchedule = () => {
    setIsClassSchedShown(true);
  };

  const hideClassSchedule = () => {
    setIsClassSchedShown(false);
  };

  const phase1Modules = [
    {
      id: 1,
      title: "Instruction",
      description: "Past perfect conjugation table",
    },
    {
      id: 2,
      title: "Individual exercise",
      description: "Kitchen vocabulary",
    },
    {
      id: 3,
      title: "Instruction",
      description:
        "Harder past perfect questions/examples, interactive between instructor + learners",
    },
    {
      id: 4,
      title: "Individual exercise",
      description:
        "Individual questions testing past perfect with kitchen vocabulary",
    },
  ];

  return isClassSchedShown ? (
    <div>
      <div className="absolute inset-0 max-h-screen overflow-y-auto">
        <MobileDetailView
          backgroundColor="bg-surface_bg_highlight"
          className="px-[16px] pt-[24px]"
          headerContent={
            <div className="flex items-center gap-[12px]">
              <BackButton onClick={hideClassSchedule} />
              <h3 className="text-typeface_primary text-h3">Class Schedule</h3>
            </div>
          }
        >
          <ClassSchedulePopUpContainer modules={phase1Modules} />
        </MobileDetailView>
      </div>
    </div>
  ) : (
    <div className="absolute inset-0 max-h-screen overflow-y-auto">
      <MobileDetailView
        backgroundColor="bg-surface_bg_highlight"
        className="px-[16px] pt-[24px]"
        headerContent={
          <div className="flex w-full justify-between">
            <h3 className="p-[8px] text-typeface_primary text-h3">
              Class details
            </h3>
            <XButton onClick={() => closeClassDetails()} />
          </div>
        }
        headerContentOnScroll={
          <div className="flex w-full items-center justify-between">
            <div className="flex gap-[16px] pl-[8px]">
              <h3 className="text-typeface_primary text-h3">
                {format(startDate, "MMMM do")}
              </h3>
              <h3 className="text-typeface_secondary text-h3">
                {format(startDate, "h:mma") + " - " + format(endDate, "h:mma")}
              </h3>
            </div>
            <XButton onClick={() => closeClassDetails()} />
          </div>
        }
      >
        <div className="overflow-y-auto">
          <SessionDetailContent
            sessionId={activeSessionId}
            handleShowClassSchedule={handleShowClassSchedule}
          />
        </div>
      </MobileDetailView>
    </div>
  );
}
