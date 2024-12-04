import { useRouter } from "next/navigation";
import BackButton from "../buttons/BackButton";
import MobileDetailView from "./MobileDetailView";
import ToggleButton from "../buttons/ToggleButton";
import { useEffect, useState } from "react";
import ButtonBar from "./ButtonBar";
import ClassModePhases from "../class-mode/ClassModePhases";
import { useLessonPlan } from "../data-retrieval/LessonPlanContext";
import ClassStats from "../ClassStats";
import InfoCard from "../InfoCard";
import HamburgerButton from "./HamburgerButton";
import MobileClassModeNotebook from "./MobileClassModeNotebook";
import { useStopwatchState } from "../class-mode/StopwatchContext";
import { useUserRole } from "../data-retrieval/UserRoleContext";
import ClassSchedulePopUpContainer from "../popups/ClassSchedulePopUpContent";
import { getGT } from "gt-next";
import dictionary from "@/dictionary";

interface MobileClassModeContainerProps {
  activePhase: any;
  activePhaseId: string;
  activeModule: any;
  activeModuleIndex: number;
  setActiveModuleIndex: (index: number) => void;
  classStarted: boolean;
  setClassStarted: (started: boolean) => void;
  handleStartClass: () => void;
  handleEndClass: () => void;
  handleNextModule: (module: any, index: number) => void;
  handleNextPhase: () => void;
  totalElapsedTime: number[];
  learners: any;
  children: JSX.Element;
}

export default function MobileClassModeContainer(
  props: MobileClassModeContainerProps,
) {
  const [activeTab, setActiveTab] = useState("Phases");
  const { phases, getModules, lessonPlan, phaseTimes } = useLessonPlan();
  const [isNotebookShown, setIsNotebookShown] = useState(false);
  const [isClassScheduleShown, setIsClassScheduleShown] = useState(false);
  const [showPhases, setShowPhases] = useState(false);
  const { userRole } = useUserRole();
  const {
    activePhase,
    activePhaseId,
    activeModule,
    activeModuleIndex,
    setActiveModuleIndex,
    classStarted,
    setClassStarted,
    handleStartClass,
    handleEndClass,
    handleNextModule,
    handleNextPhase,
    totalElapsedTime,
    learners,
    children,
  } = props;

  const t = getGT();

  const router = useRouter();
  const handleExitClassroom = () => {
    if (classStarted && !showPhases) {
      setShowPhases(true);
    } else {
      router.push("dashboard");
    }
  };

  const state = useStopwatchState();
  const { elapsedTime, elapsedLapTime } = state;

  const onToggle = (selected: string) => {
    setActiveTab(selected);
  };

  const displayNotebook = () => {
    setIsNotebookShown(true);
  };

  const displayClassSchedule = () => {
    setIsClassScheduleShown(true);
  };

    const hideClassSchedule = () => {
        setIsClassScheduleShown(false);
    };

  if (userRole === "st")
    return (
      <div>
        {isClassScheduleShown ? (
          <MobileDetailView
            backgroundColor="bg-surface_bg_highlight"
            className="px-[16px] pt-[16px]"
            headerContent={
              <div className="flex h-[44px] w-full items-center justify-center">
                <BackButton
                  variation="button-secondary"
                  onClick={hideClassSchedule}
                  className="absolute left-0"
                />
                <h3 className="text-typeface_primary text-body-medium">
                  {t("session_detail_content.class_schedule")}
                </h3>
              </div>
            }
          >
            <div className="h-screen bg-white">placeholder</div>
            {/* <ClassSchedulePopUpContainer {...lessonPlanData} /> */}
          </MobileDetailView>
        ) : (
          <div className="relative">
            <MobileDetailView
              buttonBar={true} // ideally = classStarted
              headerContent={
                <div className="relative flex w-full flex-col gap-[16px]">
                  <div className="flex h-[44px] w-full items-center justify-center">
                    <h3 className="text-typeface_primary text-body-medium">
                      {t("class_mode_content.classroom")}
                    </h3>
                    <BackButton
                      variation="button-secondary"
                      onClick={handleExitClassroom}
                      className="absolute left-0"
                    />
                    <HamburgerButton
                      onClick={displayClassSchedule}
                      variation="button-secondary"
                      className="absolute right-0"
                    />
                  </div>
                </div>
              }
              backgroundColor="bg-surface_bg_highlight"
              className="px-[16px] pt-[16px]"
            >
              {children}
            </MobileDetailView>
            {/* {buttonBarContent} */}
          </div>
        )}
      </div>
    );
  else if (userRole === "in")
    return (
      <div>
        {isNotebookShown && (
          <MobileClassModeNotebook
            activeModuleIndex={activeModuleIndex}
            modules={getModules(activePhaseId)}
            learners={learners}
            setIsNotebookShown={setIsNotebookShown}
          />
        )}
        <MobileDetailView
          buttonBar={true}
          headerContent={
            <div className="relative flex w-full flex-col gap-[16px]">
              <div className="flex h-[44px] w-full items-center justify-center">
                <h3 className="text-typeface_primary text-body-medium">
                  {t("class_mode_content.classroom")}
                </h3>
                <BackButton
                  variation="button-secondary"
                  onClick={handleExitClassroom}
                  className="absolute left-0"
                />
                {classStarted && (
                  <HamburgerButton
                    onClick={displayNotebook}
                    variation="button-secondary"
                    className="absolute right-0"
                  />
                )}
              </div>
              {!classStarted && (
                <ToggleButton
                  buttonOptions={[
                    t("class_mode_content.phases"),
                    t("class_mode_content.class_details"),
                  ]}
                  selected={activeTab}
                  onToggle={onToggle}
                />
              )}
            </div>
          }
          backgroundColor="bg-surface_bg_highlight"
          className="px-[16px] pt-[16px]"
        >
          {classStarted && activeModule && !showPhases ? (
            children
          ) : (
            <div className="">
              {activeTab === t("class_mode_content.phases") ? (
                <div className="flex flex-col gap-[24px]">
                  <ClassModePhases
                    phases={phases}
                    phaseTimes={phaseTimes}
                    activePhase={activePhase}
                    activeModule={activeModule}
                    activeModuleIndex={activeModuleIndex}
                    totalElapsedTime={totalElapsedTime}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-[32px]">
                  <p className="pt-[16px] text-typeface_primary text-body-regular">
                    {lessonPlan.lesson_plan_description}
                  </p>
                  <InfoCard>
                    <ClassStats
                      attending="80/120"
                      level="C1"
                      agenda="Target"
                      classCode="7FJR92"
                      direction="flex-col gap-[16px]"
                      isMobile={true}
                    />
                  </InfoCard>
                </div>
              )}
            </div>
          )}
        </MobileDetailView>
        {classStarted ? (
          <ButtonBar
            primaryButtonText={
              activeModuleIndex === activePhase.modules.length - 1
                ? phases.indexOf(activePhase) === phases.length - 1
                  ? t("button_content.end_class")
                  : t("button_content.next_phase")
                : t("button_content.next_module")
            }
            primaryButtonClassName={
              Math.min(
                elapsedLapTime,
                activeModule.suggested_duration_seconds,
              ) /
                activeModule.suggested_duration_seconds >
              0.05
                ? "button-primary"
                : "button-disabled"
            }
            primaryButtonOnClick={
              showPhases
                ? () => setShowPhases(false)
                : activeModuleIndex === activePhase.modules.length - 1
                  ? phases.indexOf(activePhase) === phases.length - 1
                    ? () => handleEndClass()
                    : () => handleNextPhase()
                  : () => handleNextModule(activeModule, activeModuleIndex)
            }
            secondaryContent={
              <div className="flex items-center gap-[4px] pl-[8px]">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14ZM7.25 4V8V8.31066L7.46967 8.53033L9.96967 11.0303L11.0303 9.96967L8.75 7.68934V4H7.25Z"
                    fill="var(--typeface_primary)"
                  />
                </svg>
                <p className="whitespace-nowrap text-typeface_primary text-body-semibold">
                  {activeModule &&
                    Math.round(
                      (activeModule.suggested_duration_seconds - elapsedTime) /
                        60,
                    )}{" "}
                  mins left
                </p>
              </div>
            }
          />
        ) : (
          phases &&
          phases.length > 0 && (
            <ButtonBar
              primaryButtonText={t("button_content.start_class")}
              primaryButtonOnClick={handleStartClass}
              secondaryButtonText={t("button_content.share_code")}
            />
          )
        )}
      </div>
    );
}
