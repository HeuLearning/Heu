import { useEffect } from "react";
import PhaseCard from "./PhaseCard";
import { useResponsive } from "../ResponsiveContext";
import { useStopwatchControls, useStopwatchState } from "./StopwatchContext";

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
    
    // Check if activePhase is defined
    if (activePhase) {
      console.log(activePhase.phase_duration_seconds);
      if (elapsedTime >= activePhase.phase_duration_seconds) {
        stopTimer();
      }
    }

    // Check for activeModule and its timing
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
      key={phase.id} // Ensure a unique key for each PhaseCard
      type={phase.type}
      title={phase.name}
      time={phaseTimes.get(phase.id)}
      percentage={
        activePhase === phase
          ? elapsedTime / (activePhase ? activePhase.phase_duration_seconds : 1) // Use a fallback value to avoid division by zero
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
