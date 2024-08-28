import ShowMoreButton from "../buttons/ShowMoreButton";
import ClassItemDetailed from "../ClassItemDetailed";
import { useResponsive } from "../ResponsiveContext";

export default function ClassSchedulePopUpContainer({
  phases,
  getModules,
  phaseTimes,
}) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  return (
    <div>
      <div className="flex flex-col gap-[12px]">
        {phases.map((phase) => (
          <ShowMoreButton
            title={phase.name}
            subtitle={phaseTimes.get(phase.id)}
            childrenStyling={`px-[8px] pt-[24px] pb-[12px] ${
              isMobile ? "gap-[32px]" : "gap-[24px]"
            }`}
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
