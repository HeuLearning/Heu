import ModuleDetail from "./ModuleDetail";
import { useResponsive } from "../ResponsiveContext";

interface PhaseLineUpProps {
  modules: any;
  activeModuleIndex: number;
}

export default function PhaseLineUp({ modules, activeModuleIndex }: PhaseLineUpProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  return (
    <div className="flex justify-between gap-[24px]">
      <div
        className={`flex flex-grow flex-col ${
          isMobile ? "gap-[48px]" : "gap-[24px]"
        } ${activeModuleIndex != 0 ? "" : "mt-[18px] pb-[10px]"}`}
      >
        {modules.map((module: any, index: number) => (
          <ModuleDetail
            key={module.id}
            active={index === activeModuleIndex}
            number={index + 1}
            title={module.name}
            description={module.description}
            done={activeModuleIndex >= index}
          />
        ))}
      </div>
    </div>
  );
}
