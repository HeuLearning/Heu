import ClassStats from "./ClassStats";
import SideBar from "./SideBar";

export default function ClassDetailsContainer() {
  return (
    <SideBar className="space-y-[100px]">
      <div className="space-y-[24px]">
        <h3 className="text-typeface_primary text-h3">Class details</h3>
        <p className="text-typeface_primary text-body-regular">
          Plan and deliver engaging lessons that integrate listening, speaking,
          reading,and writing activities, tailored to students' proficiency
          levels, and include clear objectives, interactive exercises, and
          regular assessments to monitor progress.
        </p>
      </div>
      <ClassStats
        svgBgColor="surface_bg_highlight"
        direction="flex-col gap-[32px]"
      />
    </SideBar>
  );
}
