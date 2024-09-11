import ClassStats from "../ClassStats";
import SideBar from "../SideBar";

interface ClassDetailsContainerProps {
  lessonPlan: any;
}

export default function ClassDetailsContainer({ lessonPlan }: ClassDetailsContainerProps) {
  return (
    <SideBar className="flex flex-col justify-between">
      <div className="space-y-[24px]">
        <h3 className="text-typeface_primary text-h3">Class details</h3>
        <p className="text-typeface_primary text-body-regular">
          {lessonPlan.lesson_plan_description}
        </p>
      </div>
      <div className="px-[4px] pb-[14px]">
        <ClassStats
          attending="80/120"
          level="C1"
          agenda="Target"
          classCode="7FJR92"
          direction="flex-col gap-[32px]"
        />
      </div>
    </SideBar>
  );
}
