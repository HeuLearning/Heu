import { useRouter } from "next/router";
import BackButton from "../BackButton";
import MobileDetailView from "./MobileDetailView";
import ToggleButton from "../ToggleButton";
import { useState } from "react";
import ButtonBar from "./ButtonBar";
import ClassModePhases from "../ClassModePhases";
import useStopwatch from "../hooks/useStopwatch";
import { useLessonPlan } from "../LessonPlanContext";

export default function MobileClassMode() {
  const [activeTab, setActiveTab] = useState("Phases");
  const { phases, getModules, lessonPlan, phaseTimes } = useLessonPlan();
  const [activePhaseId, setActivePhaseId] = useState<number | null>(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);

  const [
    { isRunning, elapsedTime, elapsedLapTime },
    { startTimer, stopTimer, resetTimer, lapTimer, setElapsedTime },
  ] = useStopwatch();

  const activePhase = phases.find((phase) => phase.id === activePhaseId);
  const activeModule = activePhase?.modules[activeModuleIndex];

  const router = useRouter();
  const handleExitClassroom = () => {
    router.push("/instructor/instructor-test");
  };

  const onToggle = (selected) => {
    setActiveTab(selected);
  };

  return (
    <div>
      <MobileDetailView
        buttonBar={true}
        headerContent={
          <div className="relative flex w-full flex-col gap-[16px]">
            <div className="flex items-center justify-center">
              <h3 className="text-typeface_primary text-body-medium">
                Classroom
              </h3>
              <div className="absolute left-0">
                <BackButton onClick={handleExitClassroom} />
              </div>
            </div>
            <ToggleButton
              buttonOptions={["Phases", "Class details"]}
              selected={activeTab}
              onToggle={onToggle}
            />
          </div>
        }
        backgroundColor="bg-surface_bg_highlight"
        className="px-[16px] pt-[24px]"
      >
        <div className="">
          {activeTab === "Phases" ? (
            <div className="flex flex-col gap-[32px]">
              <ClassModePhases
                phases={phases}
                phaseTimes={phaseTimes}
                activePhase={activePhase}
                elapsedTime={elapsedTime}
              />
            </div>
          ) : null}
        </div>
      </MobileDetailView>
      <ButtonBar
        primaryButtonText="Start class"
        primaryButtonOnClick={""}
        secondaryButtonText="Share code"
      />
    </div>
  );
}
