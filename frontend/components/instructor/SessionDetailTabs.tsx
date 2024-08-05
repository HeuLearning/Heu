import SessionDetailContent from "./SessionDetailContent";
import { useSessions } from "./SessionsContext";
import { format, isSameDay } from "date-fns";
import { useMemo, useEffect, useState } from "react";
import SessionTab from "./SessionTab";

export default function SessionDetailTabs({
  activeSessionByDate,
  handleShowClassSchedule,
}) {
  const { upcomingSessions, getSessionStatus } = useSessions();
  const filteredSessions = useMemo(
    () =>
      upcomingSessions.filter((session) =>
        isSameDay(new Date(session.start_time), activeSessionByDate)
      ),
    [upcomingSessions, activeSessionByDate]
  );
  const [activeSessionTab, setActiveSessionTab] = useState(() =>
    filteredSessions.length > 0 ? filteredSessions[0].id : null
  );

  useEffect(() => {
    if (filteredSessions.length > 0) {
      setActiveSessionTab(filteredSessions[0].id);
    }
  }, [filteredSessions]);

  const handleChangeSession = (sessionId) => {
    setActiveSessionTab(sessionId);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-[8px] pl-[24px]">
        {filteredSessions.map((session) => (
          <SessionTab
            status={getSessionStatus(session)}
            selected={session.id === activeSessionTab}
            className=""
            onClick={() => handleChangeSession(session.id)}
          >
            {format(session.start_time, "h:mma") +
              " - " +
              format(session.end_time, "h:mma")}
          </SessionTab>
        ))}
      </div>
      <div className="ml-[24px] h-full border-t-[1px] border-surface_border_tertiary pt-[24px]">
        <SessionDetailContent
          sessionId={activeSessionTab}
          handleShowClassSchedule={handleShowClassSchedule}
        />
      </div>
    </div>
  );
}
