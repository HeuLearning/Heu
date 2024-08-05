import SessionDetailContent from "./SessionDetailContent";

export default function SessionDetailSingle({
  activeSessionId,
  handleShowClassSchedule,
}) {
  return (
    <div className="h-full pl-[24px] pt-[24px]">
      <SessionDetailContent
        sessionId={activeSessionId}
        handleShowClassSchedule={handleShowClassSchedule}
      />
    </div>
  );
}
