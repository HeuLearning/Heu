import ModuleDetail from "./ModuleDetail";
import styles from "./PhaseLineUp.module.css";

export default function PhaseLineUp({ modules, activeModuleIndex }) {
  return (
    <div className="flex justify-between gap-[24px]">
      <div
        className={`flex flex-grow flex-col gap-[24px] ${
          activeModuleIndex != 0 ? "" : "mt-[18px] pb-[10px]"
        }`}
      >
        {modules.map((module, index) => (
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
