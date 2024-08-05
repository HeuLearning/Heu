import ModuleDetail from "./ModuleDetail";
import styles from "./PhaseLineUp.module.css";

export default function PhaseLineUp({ modules }) {
  const firstActiveModuleIndex = modules.findIndex(
    (module) => module.completion / module.duration < 1
  );

  return (
    <div className="flex justify-between gap-[24px]">
      <div
        className={`flex flex-grow flex-col gap-[24px] px-[8px] ${
          firstActiveModuleIndex != 0 ? "pt-[24px]" : "pt-[10px]"
        }`}
      >
        {modules.map((module, index) => (
          <ModuleDetail
            key={module.id}
            active={index === firstActiveModuleIndex}
            number={module.id}
            title={module.title}
            description={module.description}
            duration={module.duration}
            completion={module.completion}
          />
        ))}
      </div>
    </div>
  );
}
