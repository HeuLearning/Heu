import { useEffect } from "react";
import PhaseCard from "./PhaseCard";
import { useResponsive } from "../ResponsiveContext";
import { useStopwatchControls, useStopwatchState } from "./StopwatchContext";
import Module from "module";

interface ClassModePhasesProps {
  phases: any[];
  phaseTimes: Map<string, string>;
  activePhase: any;
  activeModule: any;
  activeModuleIndex: number;
  totalElapsedTime: number[];
}

export default function ClassModePhases({
  phases,
  phaseTimes,
  activePhase,
  activeModule,
  activeModuleIndex,
  totalElapsedTime,
}: ClassModePhasesProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const state = useStopwatchState();
  const { elapsedTime } = state;
  const controls = useStopwatchControls();
  const { stopTimer } = controls;

  useEffect(() => {
    console.log(elapsedTime);
    console.log(activePhase.phase_duration_seconds);
    if (activePhase && elapsedTime >= activePhase.phase_duration_seconds) {
      stopTimer();
    }
    if (
      activeModule &&
      totalElapsedTime.length - 1 === activeModuleIndex &&
      elapsedTime >=
        totalElapsedTime[activeModuleIndex] +
          activeModule.suggested_duration_seconds
    ) {
      stopTimer();
    }
  }, [elapsedTime, activePhase, activeModule, activeModuleIndex]);

  return phases.map((phase, index) => (
    <PhaseCard
      type={phase.type}
      title={phase.name}
      time={phaseTimes.get(phase.id)}
      percentage={
        activePhase === phase
          ? elapsedTime / phase.phase_duration_seconds
          : phases.indexOf(activePhase) > index
            ? 1
            : 0
      }
      status={
        phases.indexOf(activePhase) > index
          ? "done"
          : activePhase === phase
            ? "active"
            : ""
      }
    />
  ));
}
