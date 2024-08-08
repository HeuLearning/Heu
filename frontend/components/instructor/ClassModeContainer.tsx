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
import PopUp from "./PopUp";
import XButton from "./XButton";
import PhaseLineup from "./PhaseLineup";
import WordBankItem from "components/exercise/WordBankItem";
import AudioPlayer from "components/exercise/AudioPlayer";
import Checkbox from "components/exercise/Checkbox";
import RadioButton from "components/exercise/RadioButton";
import CircledLabel from "./CircledLabel";
import Draggable from "./Draggable";
import Droppable from "./Droppable";
import { DndContext, closestCenter } from "@dnd-kit/core";
import ImageCard from "components/exercise/ImageCard";

interface Item {
  id: string;
  content: string;
  letter?: string;
  draggable?: boolean;
  droppable?: boolean;
  dropped?: boolean;
  x?: boolean;
}

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

export default function ClassModeContainer({ sessionId }) {
  const [activePhaseId, setActivePhaseId] = useState<number | null>(null);
  const { upcomingSessions } = useSessions();
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [items, setItems] = useState<Item[]>([
    { id: "drop1", content: "", droppable: true, dropped: false },
    { id: "drop2", content: "", droppable: true, dropped: false },
    { id: "drop3", content: "", droppable: true, dropped: false },
    { id: "drop4", content: "", droppable: true, dropped: false },
    { id: "drop5", content: "", droppable: true, dropped: false },
    {
      id: "drag1",
      content: "It's 19 Solo Drive.",
      letter: "A",
      draggable: true,
      dropped: false,
      x: false,
    },
    {
      id: "drag2",
      content: "I'm from China.",
      letter: "B",
      draggable: true,
      dropped: false,
      x: false,
    },
    {
      id: "drag3",
      content: "I'm Han.",
      letter: "C",
      draggable: true,
      dropped: false,
      x: false,
    },
    {
      id: "drag4",
      content: "My teacher is Gracie Smith.",
      letter: "D",
      draggable: true,
      dropped: false,
      x: false,
    },
    {
      id: "drag5",
      content: "It's H-A-N.",
      letter: "E",
      draggable: true,
      dropped: false,
      x: false,
    },
  ]);

  const { hidePopUp, showPopUp } = usePopUp();

  const activePhase = phases.find((m) => m.id === activePhaseId);

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

  const router = useRouter();

  const handleBack = () => {
    router.push("instructor-test");
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active) {
      const overItem = items.find((item) => item.id === over.id);
      const activeItem = items.find((item) => item.id === active.id);

      if (
        overItem &&
        activeItem &&
        ((overItem.droppable && activeItem.draggable) ||
          (overItem.draggable && activeItem.droppable))
      ) {
        setItems((prevItems) => {
          return prevItems.map((item) => {
            if (item.id === over.id) {
              return {
                ...item,
                content: activeItem.content,
                letter: activeItem.letter,
                draggable: false,
                droppable: false,
                x: true,
              };
            } else if (item.id === active.id) {
              return {
                ...item,
                content: "",
                letter: "",
                draggable: false,
                droppable: true,
              };
            }
            return item;
          });
        });
      }
    }
  };

  const handleDragDropReset = (id) => {
    setItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            draggable: true,
            droppable: false,
            x: false,
          };
        }
        return item;
      });
    });
  };

  const handleNextModule = (module) => {
    module.completion = module.duration;
  };

  const handleShowLearners = () => {
    showPopUp({
      id: "learners-popup",
      content: (
        <PopUp className="absolute right-0 top-0 flex flex-col gap-[24px]">
          <div className="flex items-center justify-between font-medium text-typeface_primary text-h3">
            Learners
            <XButton onClick={() => hidePopUp("learners-popup")} />
          </div>
          <div className="flex flex-col gap-[16px]">
            {learners.map((learner) => (
              <LearnerItem name={learner.name} status={learner.status} />
            ))}
          </div>
        </PopUp>
      ),
      container: "#class-mode-container", // Ensure this ID exists in your DOM
      style: {
        overlay: "bg-surface_bg_darkest bg-opacity-[0.08] rounded-[20px]",
      },
      height: "auto",
    });
  };

  const displayPhaseLineup = () => {
    showPopUp({
      id: "phase-lineup-popup",
      content: (
        <PopUp className="absolute right-0 top-0 flex flex-col gap-[24px]">
          <div className="flex items-center justify-between font-medium text-typeface_primary text-h3">
            Modules in this phase
            <XButton onClick={() => hidePopUp("phase-lineup-popup")} />
          </div>
          <PhaseLineup modules={phase1Modules} />
        </PopUp>
      ),
      container: "#class-mode-container", // Ensure this ID exists in your DOM
      style: {
        overlay: "bg-surface_bg_darkest bg-opacity-[0.08] rounded-[20px]",
      },
      height: "auto",
    });
  };

  const PhaseDetails = ({ phase, onBack }) => (
    <div className="flex flex-col gap-[8px]">
      <ClassModeHeaderBar
        onBack={onBack}
        iconName={phase.type}
        title={phase.title}
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
            <button onClick={displayPhaseLineup}>
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
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
        >
          <div className="flex gap-4">
            <div className="flex w-[263px] flex-col gap-[4px] rounded-[14px] bg-surface_bg_secondary p-[4px]">
              {items
                .filter((item) => item.id.includes("drop"))
                .map((item) => (
                  <WordBankItem
                    key={item.id}
                    id={item.id}
                    letter={item.letter}
                    draggable={item.draggable}
                    droppable={item.droppable}
                    x={item.x}
                    handleReset={() => handleDragDropReset(item.id)}
                  >
                    {item.content}
                  </WordBankItem>
                ))}
            </div>
            <div className="flex w-[263px] flex-col gap-[4px] rounded-[14px] bg-surface_bg_secondary p-[4px]">
              {items
                .filter((item) => item.id.includes("drag"))
                .map((item) => (
                  <WordBankItem
                    key={item.id}
                    id={item.id}
                    letter={item.letter}
                    draggable={item.draggable}
                    droppable={item.droppable}
                    x={item.x}
                    handleReset={() => handleDragDropReset(item.id)}
                  >
                    {item.content}
                  </WordBankItem>
                ))}
            </div>
          </div>
        </DndContext>
        <ImageCard
          caption="bedroom"
          imageLink="https://media.istockphoto.com/id/1444929379/photo/square-wooden-mock-up-with-sofa-and-green-plants-on-white-wall-in-living-room-3d-illustration.jpg?b=1&s=612x612&w=0&k=20&c=UYpyRLHPyuXcA9EltpNvsl58NXrggXq53jdwhmLFNbE="
        />
        <AudioPlayer audioSrc="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" />
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

  if (!isLoading) {
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
                <Button className="button-primary">Start class</Button>
              }
            />
            <div className="flex flex-grow justify-between gap-[24px]">
              <div className="grid flex-grow grid-cols-3 grid-rows-2 gap-[16px]">
                {phases.map((phase) => (
                  <PhaseCard
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
}
