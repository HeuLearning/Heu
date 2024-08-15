import Button from "./Button";
import ClassDetailsContainer from "./ClassDetailsContainer";
import ClassModeHeaderBar from "./ClassModeHeaderBar";
import PhaseCard from "./PhaseCard";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import LearnerItem from "./LearnerItem";
import CompletionBar from "./CompletionBar";
import { useSessions } from "./SessionsContext";
import { format } from "date-fns";
import { usePopUp } from "./PopUpContext";
import SidePopUp from "./SidePopUp";
import XButton from "./XButton";
import PhaseLineup from "./PhaseLineup";
import WordBankItem from "components/exercise/WordBankItem";
import AudioPlayer from "components/exercise/AudioPlayer";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";
import ImageCard from "components/exercise/ImageCard";
import Textbox from "components/exercise/Textbox";
import MinimalExample from "./MinimalExample";
import ConversationBubble from "components/exercise/ConversationBubble";
import { useLessonPlan } from "./LessonPlanContext";
import useStopwatch from "./hooks/useStopwatch";
import CircledLabel from "./CircledLabel";
import PopUp from "./PopUp";
import ClassModePhases from "./ClassModePhases";

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
  {
    id: 1,
    name: "Julia Ying",
    status: "In class",
  },
  {
    id: 1,
    name: "Julia Ying",
    status: "In class",
  },
  {
    id: 1,
    name: "Julia Ying",
    status: "In class",
  },
  {
    id: 1,
    name: "Julia Ying",
    status: "In class",
  },
  {
    id: 1,
    name: "Julia Ying",
    status: "In class",
  },
  {
    id: 1,
    name: "Julia Ying",
    status: "In class",
  },
  {
    id: 1,
    name: "Julia Ying",
    status: "In class",
  },
  {
    id: 1,
    name: "Julia Ying",
    status: "In class",
  },
  {
    id: 1,
    name: "Julia Ying",
    status: "In class",
  },
];

export default function ClassModeContainer({ sessionId }) {
  const { phases, getModules, lessonPlan, phaseTimes } = useLessonPlan();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  );

  const [
    { isRunning, elapsedTime, elapsedLapTime },
    { startTimer, stopTimer, resetTimer, lapTimer, setElapsedTime },
  ] = useStopwatch();

  const [activePhaseId, setActivePhaseId] = useState<number | null>(null);
  const [showInitialClassPage, setShowInitialClassPage] = useState(true);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeItem, setActiveItem] = useState(null);
  const [totalElapsedTime, setTotalElapsedTime] = useState([0]);
  const [classStarted, setClassStarted] = useState(false);

  const { upcomingSessions } = useSessions();
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dropItems, setDropItems] = useState([
    {
      id: "drop1",
      letter: "",
      content: "",
      droppable: true,
      draggable: false,
      x: false,
    },
    {
      id: "drop2",
      letter: "",
      content: "",
      droppable: true,
      draggable: false,
      x: false,
    },
    {
      id: "drop3",
      letter: "",
      content: "",
      droppable: true,
      draggable: false,
      x: false,
    },
    {
      id: "drop4",
      letter: "",
      content: "",
      droppable: true,
      draggable: false,
      x: false,
    },
    {
      id: "drop5",
      letter: "",
      content: "",
      droppable: true,
      draggable: false,
      x: false,
    },
  ]);
  const [dragItems, setDragItems] = useState([
    {
      id: "drag1",
      content: "It's 19 Solo Drive.",
      letter: "A",
      draggable: true,
      droppable: false,
      x: false,
    },
    {
      id: "drag2",
      content: "I'm from China.",
      letter: "B",
      draggable: true,
      droppable: false,
      x: false,
    },
    {
      id: "drag3",
      content: "I'm Han.",
      letter: "C",
      draggable: true,
      droppable: false,
      x: false,
    },
    {
      id: "drag4",
      content: "My teacher is Gracie Smith.",
      letter: "D",
      draggable: true,
      droppable: false,
      x: false,
    },
    {
      id: "drag5",
      content: "It's H-A-N.",
      letter: "E",
      draggable: true,
      droppable: false,
      x: false,
    },
  ]);

  const [placeholders, setPlaceholders] = useState([
    { id: "placeholder1", droppable: true, placeholder: true },
    { id: "placeholder2", droppable: true, placeholder: true },
    { id: "placeholder3", droppable: true, placeholder: true },
    { id: "placeholder4", droppable: true, placeholder: true },
    { id: "placeholder5", droppable: true, placeholder: true },
  ]);

  const [originalDragItems, setOriginalDragItems] = useState([]);

  useEffect(() => {
    setOriginalDragItems(dragItems);
  }, []);

  const { hidePopUp, showPopUp } = usePopUp();

  const activePhase = phases.find((phase) => phase.id === activePhaseId);
  const activeModule = activePhase?.modules[activeModuleIndex];

  useEffect(() => {
    const findSession = () => {
      if (upcomingSessions && sessionId) {
        const found = upcomingSessions.find((s) => s.id === Number(sessionId));
        setSession(found || null);
        setIsLoading(false);
      }
    };

    findSession();
  }, [sessionId, upcomingSessions]);

  // set initial activePhaseId
  useEffect(() => {
    if (phases.length > 0) {
      setActivePhaseId(phases[0].id);
    }
  }, [phases]);

  useEffect(() => {
    setActiveModuleIndex(0);
  }, [activePhaseId]);

  const handleDragDropReset = (id) => {
    const oldIndex = originalDragItems.findIndex((item) => item.id === id);
    const originalDragItem = dropItems.find((item) => item.id === id);
    const originalDropItem = dragItems[oldIndex];

    setDragItems((prevItems) => {
      const newItems = prevItems.map((item, index) => {
        if (index === oldIndex) {
          return { ...originalDragItem, x: false };
        }
        return item;
      });
      return newItems;
    });
    setDropItems((prevItems) => {
      const newItems = prevItems.map((item, index) => {
        if (item.id === id) {
          return { ...originalDropItem };
        }
        return item;
      });
      return newItems;
    });
  };

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

  const router = useRouter();
  const handleBack = () => {
    router.push("instructor-test");
  };

  function handleDragStart(event) {
    const newActiveItem = dragItems.find((item) => item.id === event.active.id);
    setActiveItem(newActiveItem);
  }

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active) {
      const overItem = dropItems.find((item) => item.id === over.id);
      const activeItem = dragItems.find((item) => item.id === active.id);

      if (overItem && activeItem) {
        setDropItems((prevItems) => {
          return prevItems.map((item) => {
            if (item.id === over.id) {
              return { ...activeItem, x: true };
            }
            return item;
          });
        });
        setDragItems((prevItems) => {
          return prevItems.map((item) => {
            if (item.id === active.id) {
              return { ...overItem, letter: null };
            }
            return item;
          });
        });
        setPlaceholders((prevItems) => {
          return prevItems.map((item) => {
            if (item.id.charAt(-1) === active.id.charAt(-1)) {
              return { ...item, droppable: false };
            }
          });
        });
      }
    }
    setActiveItem(null);
  };

  const handleNextModule = (module, index) => {
    totalElapsedTime.push(
      totalElapsedTime[index] + module.suggested_duration_seconds
    );
    setElapsedTime(totalElapsedTime[index + 1]);
    startTimer();
    lapTimer();
    setActiveModuleIndex(index + 1);
  };

  console.log(activeModuleIndex);
  console.log(totalElapsedTime);

  const handleNextPhase = () => {
    const currentPhaseIndex = phases.findIndex(
      (phase) => phase.id === activePhaseId
    );
    if (currentPhaseIndex < phases.length - 1) {
      const nextPhase = phases[currentPhaseIndex + 1];
      setActivePhaseId(nextPhase.id);
      setActiveModuleIndex(0); // Reset to the first module of the new phase
      setTotalElapsedTime([0]); // Add a new elapsed time for the new phase
      setElapsedTime(0); // Reset elapsed time for the new phase
      resetTimer();
      startTimer(); // Start the timer for the new phase
    }
  };

  const handleEndClass = () => {
    alert("Class finished");
    router.push("instructor-test");
  };

  const handleEndClassPopUp = () => {
    showPopUp({
      id: "end-class-popup",
      content: (
        <PopUp
          header="End class"
          primaryButtonText="End class"
          secondaryButtonText="Cancel"
          primaryButtonOnClick={() => handleEndClass()}
          secondaryButtonOnClick={() => hidePopUp("end-class-popup")}
          popUpId="end-class-popup"
        >
          <p className="text-typeface_primary text-body-regular">
            Are you sure you'd like to proceed and end the current class?
          </p>
        </PopUp>
      ),
      container: null, // Ensure this ID exists in your DOM
      style: {
        overlay: "overlay-high",
      },
      height: "auto",
    });
  };

  const handleResetTimer = () => {
    resetTimer();
    setActiveModuleIndex(0);
    setActivePhaseId(phases[0].id);
    setTotalElapsedTime([0]);
    setClassStarted(false);
  };

  const handleStartClass = () => {
    setShowInitialClassPage(false);
    if (!classStarted) {
      startTimer();
    }
    setClassStarted(true);
  };

  const handleShowLearners = () => {
    showPopUp({
      id: "learners-popup",
      content: (
        <SidePopUp
          headerContent={
            <div className="flex items-center justify-between font-medium text-typeface_primary text-h3">
              Learners
              <XButton onClick={() => hidePopUp("learners-popup")} />
            </div>
          }
          className="absolute right-0 top-0 flex flex-col"
        >
          <div className="flex flex-col gap-[16px]">
            {learners.map((learner) => (
              <LearnerItem name={learner.name} status={learner.status} />
            ))}
          </div>
        </SidePopUp>
      ),
      container: "#class-mode-container", // Ensure this ID exists in your DOM
      style: {
        overlay: "overlay-low rounded-[20px]",
      },
      height: "auto",
    });
  };

  const displayPhaseLineup = (phaseId) => {
    showPopUp({
      id: "phase-lineup-popup",
      content: (
        <SidePopUp
          headerContent={
            <div className="flex items-center justify-between font-medium text-typeface_primary text-h3">
              Modules in this phase
              <XButton onClick={() => hidePopUp("phase-lineup-popup")} />
            </div>
          }
          className="absolute right-0 top-0 flex flex-col"
        >
          <PhaseLineup
            modules={getModules(phaseId)}
            activeModuleIndex={activeModuleIndex}
          />
        </SidePopUp>
      ),
      container: "#class-mode-container", // Ensure this ID exists in your DOM
      style: {
        overlay: "overlay-low rounded-[20px]",
      },
      height: "auto",
    });
  };

  const PhaseDetails = ({ phase, onBack }) => (
    <div className="flex h-full flex-col gap-[8px]">
      <ClassModeHeaderBar
        onBack={onBack}
        iconName={"practice"}
        title={phase.name}
        rightSide={
          <div className="flex items-center gap-[12px]">
            <button onClick={handleShowLearners}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  width="32"
                  height="32"
                  rx="16"
                  fill="var(--action_bg_primary)"
                />
                <path
                  d="M12.4282 20.4775C12.1274 20.4775 11.8911 20.4095 11.7192 20.2734C11.5474 20.1374 11.4614 19.9512 11.4614 19.7148C11.4614 19.3675 11.5653 19.0041 11.7729 18.6245C11.9842 18.245 12.2868 17.8887 12.6807 17.5557C13.0781 17.2227 13.5562 16.9523 14.1147 16.7446C14.6733 16.5369 15.3 16.4331 15.9946 16.4331C16.6929 16.4331 17.3213 16.5369 17.8799 16.7446C18.4385 16.9523 18.9147 17.2227 19.3086 17.5557C19.7061 17.8887 20.0104 18.245 20.2217 18.6245C20.4329 19.0041 20.5386 19.3675 20.5386 19.7148C20.5386 19.9512 20.4526 20.1374 20.2808 20.2734C20.1089 20.4095 19.8726 20.4775 19.5718 20.4775H12.4282ZM16 15.4771C15.6097 15.4771 15.2498 15.3714 14.9204 15.1602C14.5946 14.9489 14.3314 14.6642 14.1309 14.3062C13.9339 13.9481 13.8354 13.547 13.8354 13.103C13.8354 12.6662 13.9339 12.2723 14.1309 11.9214C14.3314 11.5669 14.5964 11.2858 14.9258 11.0781C15.2552 10.8704 15.6133 10.7666 16 10.7666C16.3903 10.7666 16.7502 10.8687 17.0796 11.0728C17.409 11.2769 17.6722 11.5562 17.8691 11.9106C18.0697 12.2616 18.1699 12.6554 18.1699 13.0923C18.1699 13.5399 18.0697 13.9445 17.8691 14.3062C17.6722 14.6642 17.409 14.9489 17.0796 15.1602C16.7502 15.3714 16.3903 15.4771 16 15.4771Z"
                  fill="var(--surface_bg_highlight)"
                />
              </svg>
            </button>
            <button onClick={() => displayPhaseLineup(phase.id)}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  width="32"
                  height="32"
                  rx="16"
                  fill="var(--action_bg_primary)"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M20 11C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13L12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11H20ZM20 15C20.5523 15 21 15.4477 21 16C21 16.5523 20.5523 17 20 17H12C11.4477 17 11 16.5523 11 16C11 15.4477 11.4477 15 12 15L20 15ZM21 20C21 19.4477 20.5523 19 20 19L12 19C11.4477 19 11 19.4477 11 20C11 20.5523 11.4477 21 12 21H20C20.5523 21 21 20.5523 21 20Z"
                  fill="var(--surface_bg_highlight)"
                />
              </svg>
            </button>
          </div>
        }
      />
      <div className="flex h-full flex-col">
        <div className="flex h-[550px] flex-col gap-[28px] rounded-[10px] p-[18px] outline-surface_border_tertiary">
          <div className="flex items-center gap-[12px]">
            <CircledLabel
              bgColor="var(--surface_bg_darkest)"
              textColor="text-typeface_highlight"
            >
              {activeModuleIndex + 1}
            </CircledLabel>
            <div className="text-typeface_primary text-body-semibold">
              {activeModule.name}
            </div>
          </div>
          <div>
            <div className="flex gap-[24px]">
              <div className="w-[243px]">
                <WordBankItem id="1" letter="1">
                  What's your name?
                </WordBankItem>
                <WordBankItem id="2" letter="2">
                  How do you spell your name?
                </WordBankItem>
                <WordBankItem id="3" letter="3">
                  Where are you from?
                </WordBankItem>
                <WordBankItem id="4" letter="4">
                  What's your address?
                </WordBankItem>
                <WordBankItem id="5" letter="5">
                  Who's your teacher?
                </WordBankItem>
              </div>
              <div>
                {Array.from({ length: 5 }).map(() => (
                  <div className="p-[8px]">
                    <svg
                      width="17"
                      height="16"
                      viewBox="0 0 17 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 11.25L10.5 7.75L7 4.25"
                        stroke="var(--surface_bg_darkest)"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                    </svg>
                  </div>
                ))}
              </div>
              <DndContext
                sensors={sensors}
                onDragEnd={handleDragEnd}
                collisionDetection={closestCenter}
              >
                <div className="flex gap-4">
                  <div className="flex w-[263px] flex-col gap-[4px] rounded-[14px] bg-surface_bg_secondary p-[4px]">
                    {dropItems.map((item) => (
                      <WordBankItem
                        key={item.id}
                        id={item.id}
                        letter={item.letter}
                        droppable={item.droppable}
                        x={item.x}
                        handleReset={() => handleDragDropReset(item.id)}
                      >
                        {item.content}
                      </WordBankItem>
                    ))}
                  </div>
                  <div className="relative flex w-[263px] flex-col rounded-[14px] bg-surface_bg_secondary p-[4px]">
                    <div className="z-[2] flex w-full flex-col gap-[4px]">
                      {dragItems.map((item) => (
                        <WordBankItem
                          key={item.id}
                          id={item.id}
                          letter={item.letter}
                          draggable={item.draggable}
                          x={item.x}
                        >
                          {item.content}
                        </WordBankItem>
                      ))}
                    </div>
                    <div className="border-1px absolute left-0 top-0 z-[0] flex w-[263px] flex-col gap-[4px] rounded-[14px] border-dashed border-surface_border_primary p-[4px]">
                      {placeholders.map((item) => (
                        <WordBankItem
                          id={item.id}
                          droppable={item.droppable}
                          placeholder={item.placeholder}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div></div>
                <div>{"elapsedTime:" + elapsedTime}</div>
                <div>{"elapsed time in module: " + elapsedLapTime}</div>
              </DndContext>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-[24px] px-[24px] py-[18px]">
          <div className="flex flex-grow gap-[4px]">
            {getModules(activePhase.id).map((module, index) => (
              <CompletionBar
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
            {phaseTimes.get(phase.id)}
          </p>
          <Button
            className={
              Math.min(
                elapsedLapTime,
                activeModule.suggested_duration_seconds
              ) /
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
      </div>
    </div>
  );

  if (!isLoading) {
    return (
      <div
        id="class-mode-container"
        className="relative mb-4 ml-4 mr-4 flex min-h-[600px] flex-col rounded-[20px] bg-surface_bg_highlight p-[10px]"
      >
        {showInitialClassPage ? (
          <div>
            <ClassModeHeaderBar
              onBack={handleBack}
              title={
                session?.start_time
                  ? format(new Date(session.start_time), "eeee, MMMM do")
                  : "Loading..."
              }
              subtitle={
                session?.start_time && session?.end_time
                  ? format(new Date(session.start_time), "h:mma") +
                    " - " +
                    format(new Date(session.end_time), "h:mma")
                  : "Loading..."
              }
              rightSide={
                <div className="flex gap-[12px]">
                  {classStarted && (
                    <Button
                      className="button-tertiary"
                      onClick={handleEndClassPopUp}
                    >
                      End class
                    </Button>
                  )}
                  <Button className="button-primary" onClick={handleStartClass}>
                    {!classStarted ? "Start class" : "Continue class"}
                  </Button>
                  <Button
                    className="button-secondary"
                    onClick={handleResetTimer}
                  >
                    Reset
                  </Button>
                </div>
              }
            />

            <div className="flex flex-grow justify-between gap-[24px]">
              <div
                className={`grid flex-grow ${
                  phases.length === 1
                    ? "grid-cols-1 grid-rows-1 gap-[16px]"
                    : phases.length === 2
                    ? "grid-cols-2 grid-rows-1 gap-[16px]"
                    : phases.length === 3
                    ? "grid-cols-3 grid-rows-1 gap-[16px]"
                    : "grid-cols-3 grid-rows-2 gap-[16px]"
                }`}
              >
                <ClassModePhases
                  phases={phases}
                  phaseTimes={phaseTimes}
                  elapsedTime={elapsedTime}
                  activePhase={activePhase}
                />
              </div>
              <ClassDetailsContainer lessonPlan={lessonPlan} />
            </div>
          </div>
        ) : (
          <PhaseDetails
            phase={activePhase}
            onBack={() => setShowInitialClassPage(true)}
          />
        )}
      </div>
    );
  }
}
