import { useState } from "react";
import ToggleButton from "../ToggleButton";
import XButton from "../XButton";
import MobileDetailView from "./MobileDetailView";
import PhaseLineUp from "../PhaseLineup";
import LearnerItem from "../LearnerItem";

export default function MobileClassModeNotebook({
  activeModuleIndex,
  modules,
  learners,
  setIsNotebookShown,
}) {
  const [activeTab, setActiveTab] = useState("Modules in this phase");

  const onToggle = (selected) => {
    setActiveTab(selected);
  };
  return (
    <MobileDetailView
      backgroundColor="bg-surface_bg_highlight"
      headerContent={
        <div className="flex w-full flex-col gap-[32px]">
          <div className="flex items-center justify-center">
            <h1 className="text-typeface_primary text-body-medium">Notebook</h1>
            <div className="absolute right-0">
              <XButton onClick={() => setIsNotebookShown(false)} />
            </div>
          </div>
          <ToggleButton
            buttonOptions={["Modules in this phase", "Learners"]}
            selected={activeTab}
            onToggle={onToggle}
          />
        </div>
      }
      className="absolute inset-0 z-50 px-[16px] pt-[24px]"
    >
      {activeTab === "Modules in this phase" ? (
        <PhaseLineUp modules={modules} activeModuleIndex={activeModuleIndex} />
      ) : (
        <div className="flex flex-col gap-[16px]">
          {learners.map((learner) => (
            <LearnerItem name={learner.name} status={learner.status} />
          ))}
        </div>
      )}
    </MobileDetailView>
  );
}
