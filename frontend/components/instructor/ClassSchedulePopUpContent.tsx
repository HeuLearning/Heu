import PopUp from "./PopUp";
import XButton from "./XButton";
import ShowMoreButton from "./ShowMoreButton";
import ClassItemDetailed from "./ClassItemDetailed";
import { useLessonPlan } from "./LessonPlanContext";

export default function ClassSchedulePopUpContainer({
  phases,
  getModules,
  phaseTimes,
}) {
  // const { phases, getModules, phaseTimes } = lessonPlanData;
  return (
    <div>
      <div className="flex flex-col gap-[12px]">
        {phases.map((phase) => (
          <ShowMoreButton
            title={phase.name}
            subtitle={phaseTimes.get(phase.id)}
            childrenStyling="px-[8px] pt-[24px] pb-[12px] gap-[24px]"
          >
            {getModules(phase.id).map((module, index) => (
              <ClassItemDetailed
                number={index + 1}
                title={module.name}
                description={module.description}
              />
            ))}
          </ShowMoreButton>
        ))}
      </div>
    </div>
  );
}
