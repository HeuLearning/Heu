import SessionDetailContent from "./SessionDetailContent";

export default function SessionDetailSingle({
  lessonPlanData,
  activeSessionId,
  handleShowClassSchedule,
  isLessonPlanLoaded,
}) {
  return (
    <div className="h-full pl-[24px] pt-[24px]">
      <SessionDetailContent
        isLessonPlanLoaded={isLessonPlanLoaded}
        lessonPlanData={lessonPlanData}
        sessionId={activeSessionId}
        handleShowClassSchedule={handleShowClassSchedule}
      />
    </div>
  );
}
