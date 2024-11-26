import ShowMoreButton from "../buttons/ShowMoreButton";
import ClassItemDetailed from "../ClassItemDetailed";
import { useResponsive } from "../ResponsiveContext";

interface Phase {
  id: string;
  name: string;
}

interface Module {
  id: string;
  name: string;
  description: string;
}

interface ClassSchedulePopUpContainerProps {
  phases: Phase[];
  getModules: (phaseId: string) => Module[];
  phaseTimes: Map<string, string>; // assuming phaseTimes is a map of phaseId to time string
}

export default function ClassSchedulePopUpContainer({
  phases,
  getModules,
  phaseTimes,
}: ClassSchedulePopUpContainerProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return (
    <div>
      <div className="flex flex-col gap-[12px]">
        {phases.map((phase) => (
          <ShowMoreButton
            key={phase.id}
            title={phase.name}
            subtitle={phaseTimes.get(phase.id) || "No time available"}
            childrenStyling={`px-[8px] pt-[24px] pb-[12px] ${
              isMobile ? "gap-[32px]" : "gap-[24px]"
            }`}
          >
            {getModules(phase.id).map((module, index) => (
              <ClassItemDetailed
                key={module.id} // make sure to use a unique key for each element
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
