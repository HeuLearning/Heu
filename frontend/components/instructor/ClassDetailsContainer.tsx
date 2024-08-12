import ClassStats from "./ClassStats";
import SideBar from "./SideBar";

export default function ClassDetailsContainer({ lessonPlan }) {
  return (
    <SideBar className="space-y-[100px]">
      <div className="space-y-[24px]">
        <h3 className="text-typeface_primary text-h3">Class details</h3>
        <p className="text-typeface_primary text-body-regular">
          {lessonPlan.lesson_plan_description}
        </p>
      </div>
      <ClassStats
        attending="80/120"
        level="C1"
        agenda="Target"
        classCode="7FJR92"
        svgBgColor="surface_bg_highlight"
        direction="flex-col gap-[32px]"
      />
    </SideBar>
  );
}
