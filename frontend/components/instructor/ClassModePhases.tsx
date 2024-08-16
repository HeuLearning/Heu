import { useEffect } from "react";
import PhaseCard from "./PhaseCard";
import { useResponsive } from "./ResponsiveContext";
import { useStopwatchControls, useStopwatchState } from "./StopwatchContext";

export default function ClassModePhases({ phases, phaseTimes, activePhase }) {
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
      className={`${
        phases.length === 1
          ? "col-span-1 row-span-1 h-full w-full" // Make the single card take full height and width
          : phases.length === 2
          ? "col-span-2"
          : phases.length === 3
          ? "row-span-2"
          : ""
      }`}
    />
  ));
}
