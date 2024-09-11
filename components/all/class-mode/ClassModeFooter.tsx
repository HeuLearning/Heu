import { useEffect } from "react";
import Button from "../buttons/Button";
import CompletionBar from "./CompletionBar";
import { useLessonPlan } from "../data-retrieval/LessonPlanContext";
import { useStopwatchContext } from "./StopwatchContext";

interface ClassModeFooterProps {
  totalElapsedTime: number[];
  activePhase: any;
  activeModule: any;
  activeModuleIndex: number;
  handleNextModule: (module: any, index: number) => void;
  handleNextPhase: () => void;
  handleEndClass: () => void;
}

export default function ClassModeFooter({
  totalElapsedTime,
  activePhase,
  activeModule,
  activeModuleIndex,
  handleNextModule,
  handleNextPhase,
  handleEndClass,
}: ClassModeFooterProps) {
  const { phases, phaseTimes, getModules } = useLessonPlan();
  const { state, controls } = useStopwatchContext();
  const { elapsedTime, elapsedLapTime } = state;
  const { stopTimer } = controls;

  useEffect(() => {
    if (
      activeModule &&
      totalElapsedTime.length - 1 === activeModuleIndex &&
      elapsedTime >=
        totalElapsedTime[activeModuleIndex] +
          activeModule.suggested_duration_seconds
    ) {
      stopTimer();
    }
  }, [elapsedTime, activeModule, activeModuleIndex]);

  return (
    <div className="flex items-center justify-between gap-[24px] px-[24px] pb-[10px] pt-[12px]">
      <div className="flex flex-grow gap-[8px]">
        {getModules(activePhase.id)?.map((module, index) => (
          <CompletionBar
            key={index}
            percentage={
              activeModuleIndex === index
                ? elapsedLapTime / module.suggested_duration_seconds
                : activeModuleIndex > index
                ? 1
                : 0
            }
          />
        ))}
      </div>
      <p className="whitespace-nowrap text-typeface_primary text-body-semibold">
        {phaseTimes.get(activePhase.id)}
      </p>
      <Button
        className={
          Math.min(elapsedLapTime, activeModule.suggested_duration_seconds) /
            activeModule.suggested_duration_seconds >
          0.05
            ? "button-primary"
            : "button-disabled"
        }
        onClick={
          activeModuleIndex === activePhase.modules.length - 1
            ? phases.indexOf(activePhase) === phases.length - 1
              ? () => handleEndClass()
              : () => handleNextPhase()
            : () => handleNextModule(activeModule, activeModuleIndex)
        }
      >
        {activeModuleIndex === activePhase.modules.length - 1
          ? phases.indexOf(activePhase) === phases.length - 1
            ? "End class"
            : "Next phase"
          : "Next module"}
      </Button>
    </div>
  );
}
