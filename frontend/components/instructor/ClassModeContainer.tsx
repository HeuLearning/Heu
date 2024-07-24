import BackButton from "./BackButton";
import ClassDetailsContainer from "./ClassDetailsContainer";
import ClassModeHeaderBar from "./ClassModeHeaderBar";
import Phase from "./Phase";
import { useState } from "react";
import { useRouter } from "next/router";
import ModuleDetail from "./ModuleDetail";
import SideBar from "./SideBar";
import ToggleButton from "./ToggleButton";
import LearnerItem from "./LearnerItem";
import CompletionBar from "./CompletionBar";

const phases = [
  {
    id: 1,
    type: "exercise",
    title: "Past perfect + kitchen vocabulary",
    time: "10:15 - 10:35",
    duration: 20,
    completion: 20,
  },
  {
    id: 2,
    type: "exercise",
    title: "Grammar conjugation",
    time: "10:15 - 10:35",
    duration: 20,
    completion: 20,
  },
  {
    id: 3,
    type: "exercise",
    title: "Grammar conjugation",
    time: "10:15 - 10:35",
    duration: 20,
    completion: 3,
  },
  {
    id: 4,
    type: "exercise",
    title: "Grammar conjugation",
    time: "10:15 - 10:35",
    duration: 20,
    completion: 0,
  },
  {
    id: 5,
    type: "exercise",
    title: "Grammar conjugation",
    time: "10:15 - 10:35",
    duration: 20,
    completion: 0,
  },
  {
    id: 6,
    type: "exercise",
    title: "Grammar conjugation",
    time: "10:15 - 10:35",
    duration: 20,
    completion: 0,
  },
];

// duration and completion in min
const phase1Modules = [
  {
    id: 1,
    title: "Instruction",
    description: "Past perfect conjugation table",
    duration: 5,
    completion: 5,
  },
  {
    id: 2,
    title: "Individual exercise",
    description: "Kitchen vocabulary",
    duration: 5,
    completion: 2,
  },
  {
    id: 3,
    title: "Instruction",
    description:
      "Harder past perfect questions/examples, interactive between instructor + learners",
    duration: 5,
    completion: 0,
  },
  {
    id: 4,
    title: "Individual exercise",
    description:
      "Individual questions testing past perfect with kitchen vocabulary",
    duration: 5,
    completion: 0,
  },
];

const learners = [
  {
    id: 1,
    name: "Julia Ying",
    status: "In class",
  },
  {
    id: 2,
    name: "Icey Ai",
    status: "In class",
  },
  {
    id: 3,
    name: "Kevin Jeon",
    status: "In class",
  },
  {
    id: 4,
    name: "Francis Barth",
    status: "In class",
  },
  {
    id: 5,
    name: "Desi DeVaul",
    status: "In class",
  },
];

export default function ClassModeContainer() {
  const [activePhaseId, setActivePhaseId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("Instructions");
  const activePhase = phases.find((m) => m.id === activePhaseId);

  const router = useRouter();

  const handleBack = () => {
    router.push("instructor-test");
  };

  const handleToggle = (selectedOption) => {
    setActiveTab(selectedOption);
  };

  const firstActiveModuleIndex = phase1Modules.findIndex(
    (module) => module.completion / module.duration < 1
  );

  const handleNextModule = (module) => {
    module.completion = module.duration;
  };

  const PhaseDetails = ({ phase, onBack }) => (
    <div className="flex flex-col gap-[8px]">
      <ClassModeHeaderBar
        onBack={onBack}
        iconName={phase.type}
        title={phase.title}
        buttonText="Next phase"
        buttonStyle={
          phase.completion / phase.duration < 1
            ? "button-disabled"
            : "text-typeface_highlight text-body-semibold-cap-height bg-action_bg_primary"
        }
      />
      <div className="flex min-h-[550px] justify-between gap-[24px]">
        <div
          className={`flex flex-grow flex-col gap-[48px] ${
            firstActiveModuleIndex != 0 ? "pt-[14px]" : ""
          }`}
        >
          {phase1Modules.map((module, index) => (
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
        <SideBar className="flex flex-col gap-[24px]">
          <h3 className="text-typeface_primary text-h3">Notebook</h3>
          <ToggleButton
            buttonOptions={["Instructions", "Learners"]}
            selected={activeTab}
            onToggle={handleToggle}
          />
          {activeTab === "Instructions" ? (
            <p className="text-typeface_primary text-body-regular">
              Plan and deliver engaging lessons that integrate listening,
              speaking, reading,and writing activities, tailored to students'
              proficiency levels, and include clear objectives, interactive
              exercises, and regular assessments to monitor progress.
            </p>
          ) : (
            learners.map((learner) => (
              <LearnerItem name={learner.name} status={learner.status} />
            ))
          )}
        </SideBar>
      </div>
      <div className="flex items-center justify-between gap-[24px] px-[24px] py-[18px]">
        <div className="flex flex-grow gap-[4px]">
          {phase1Modules.map((module) => (
            <CompletionBar percentage={module.completion / module.duration} />
          ))}
        </div>
        <p className="whitespace-nowrap text-typeface_primary text-body-semibold">
          {phase.time}
        </p>
      </div>
    </div>
  );

  return (
    <div
      id="class-mode-container"
      className="relative mb-4 ml-4 mr-4 flex min-h-[600px] flex-col rounded-[20px] bg-surface_bg_highlight p-[10px]"
    >
      {activePhase ? (
        <PhaseDetails
          phase={activePhase}
          onBack={() => setActivePhaseId(null)}
        />
      ) : (
        <div>
          <ClassModeHeaderBar
            onBack={handleBack}
            iconName="calendar"
            title="Thursday, June 20th"
            subtitle="10:00 - 11:00AM"
            buttonText="Start class"
            buttonStyle="text-typeface_highlight text-body-semibold-cap-height bg-action_bg_primary"
          />
          <div className="flex flex-grow justify-between gap-[24px]">
            <div className="grid flex-grow grid-cols-3 grid-rows-2 gap-[16px]">
              {phases.map((phase) => (
                <Phase
                  className="cursor-pointer"
                  type={phase.type}
                  title={phase.title}
                  time={phase.time}
                  duration={phase.duration}
                  completion={phase.completion}
                  onClick={() => setActivePhaseId(phase.id)}
                />
              ))}
            </div>
            <ClassDetailsContainer />
          </div>
        </div>
      )}
    </div>
  );
}
