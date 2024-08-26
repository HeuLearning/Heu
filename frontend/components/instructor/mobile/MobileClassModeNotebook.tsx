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
        <div className="flex w-full flex-col gap-[16px] px-[16px]">
          <div className="flex h-[44px] w-full items-center justify-center">
            <h1 className="text-typeface_primary text-body-medium">Notebook</h1>
            <XButton
              onClick={() => setIsNotebookShown(false)}
              className="absolute right-[16px]"
            />
          </div>
          <ToggleButton
            buttonOptions={["Modules in this phase", "Learners"]}
            selected={activeTab}
            onToggle={onToggle}
          />
        </div>
      }
      className="z-50 pt-[16px]"
    >
      {activeTab === "Modules in this phase" ? (
        <div className="px-[20px] pt-[16px]">
          <PhaseLineUp
            modules={modules}
            activeModuleIndex={activeModuleIndex}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-[20px] px-[16px] pt-[16px]">
          {learners.map((learner) => (
            <LearnerItem name={learner.name} status={learner.status} />
          ))}
        </div>
      )}
    </MobileDetailView>
  );
}
