import { useEffect } from "react";
import PhaseCard from "./PhaseCard";
import { useResponsive } from "../ResponsiveContext";
import { useStopwatchControls, useStopwatchState } from "./StopwatchContext";

interface ClassModePhasesProps {
  phases: any[];
  phaseTimes: Map<string, string>;
  activePhase: any;
}

export default function ClassModePhases({
  phases,
  phaseTimes,
  activePhase,
}: ClassModePhasesProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const state = useStopwatchState();
  const { elapsedTime } = state;
  const controls = useStopwatchControls();
  const { stopTimer } = controls;

  useEffect(() => {
    if (activePhase && elapsedTime >= activePhase.phase_duration_seconds) {
      stopTimer();
    }
  }, [elapsedTime, activePhase]);

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
