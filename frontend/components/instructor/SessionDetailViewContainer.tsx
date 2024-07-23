import InfoPill from "./InfoPill";
import Button from "./Button";
import InfoCard from "./InfoCard";
import ClassItem from "./ClassItem";
import { useState, useRef, useEffect } from "react";
import PopUp from "./PopUp";
import DropDownSelector from "./DropDownSelector";
import { usePopUp } from "./PopUpContext";
import XButton from "./XButton";
import ShowMoreButton from "./ShowMoreButton";
import ClassItemDetailed from "./ClassItemDetailed";
import ClassStats from "./ClassStats";

export default function SessionDetailViewContainer() {
  const [dashboardHeight, setDashboardHeight] = useState(0);

  useEffect(() => {
    const dashboardContainer = document.getElementById("dashboard-container");
    if (dashboardContainer) {
      const containerHeight = dashboardContainer.offsetHeight;
      setDashboardHeight(containerHeight);
    }
  }, []);

  const { showPopUp, hidePopUp } = usePopUp();

  const phase1Modules = [
    {
      id: 1,
      title: "Instruction",
      description: "Past perfect conjugation table",
    },
    {
      id: 2,
      title: "Individual exercise",
      description: "Kitchen vocabulary",
    },
    {
      id: 3,
      title: "Instruction",
      description:
        "Harder past perfect questions/examples, interactive between instructor + learners",
    },
    {
      id: 4,
      title: "Individual exercise",
      description:
        "Individual questions testing past perfect with kitchen vocabulary",
    },
  ];

  const handlePopUp = () => {
    showPopUp({
      id: "class-schedule-popup",
      content: (
        <PopUp
          className="absolute right-0 top-0 flex flex-col gap-[24px]"
          height={`${dashboardHeight}px`}
        >
          <div className="flex items-center justify-between font-medium text-typeface_primary text-h3">
            Class Schedule
            <XButton onClick={() => hidePopUp("class-schedule-popup")} />
          </div>
          <div className="flex flex-col gap-[12px]">
            <ShowMoreButton
              title="Past perfect + Kitchen Vocabulary"
              subtitle="10:00 - 10:15"
              childrenStyling="px-[8px] py-[24px] gap-[24px]"
            >
              {phase1Modules.map((module) => (
                <ClassItemDetailed
                  number={module.id}
                  title={module.title}
                  description={module.description}
                />
              ))}
            </ShowMoreButton>
            <ShowMoreButton
              title="Grammatical Conjugation"
              subtitle="10:15 - 10:30"
              childrenStyling="px-[8px] py-[24px] gap-[24px]"
            >
              blah
            </ShowMoreButton>
            <ShowMoreButton
              title="Grammatical Conjugation"
              subtitle="10:30 - 10:45"
              childrenStyling="px-[8px] py-[24px] gap-[24px]"
            >
              blah
            </ShowMoreButton>
            <ShowMoreButton
              title="Grammatical Conjugation"
              subtitle="10:45 - 11:00"
              childrenStyling="px-[8px] py-[24px] gap-[24px]"
            >
              blah
            </ShowMoreButton>
          </div>
        </PopUp>
      ),
      container: "#dashboard-container", // Ensure this ID exists in your DOM
      style: {
        overlay: "bg-surface_bg_dark bg-opacity-[0.08] rounded-[20px]",
      },
      height: "auto",
    });
  };
  return (
    <div
      id="session-detail-view"
      className="relative flex flex-col gap-[128px] px-[24px] py-[34px]"
    >
      <div className="session-info flex items-start justify-between">
        <div className="session-title space-y-[16px]">
          <div className="date-title space-y-[10px]">
            <h1 className="text-typeface_primary leading-cap-height text-h1">
              Thursday, June 20th
            </h1>
            <h1 className="text-typeface_secondary leading-tight text-h1">
              10:00 AM - 11:00 AM
            </h1>
          </div>
          <div className="flex items-center gap-[12px]">
            <div className="flex items-center">
              <svg
                width="16"
                height="16"
                viewBox="0 2 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="16" height="16" fill="white" />
                <path
                  d="M5.87305 5.21729C5.87305 4.8234 5.96794 4.46533 6.15771 4.14307C6.34749 3.8208 6.60173 3.56478 6.92041 3.375C7.24268 3.18164 7.60075 3.08496 7.99463 3.08496C8.39209 3.08496 8.75016 3.18164 9.06885 3.375C9.39111 3.56478 9.64714 3.8208 9.83691 4.14307C10.0267 4.46533 10.1216 4.8234 10.1216 5.21729C10.1216 5.54313 10.0535 5.84749 9.91748 6.13037C9.78141 6.40967 9.59521 6.64958 9.35889 6.8501C9.12256 7.05062 8.85579 7.19027 8.55859 7.26904V12.3179C8.55859 12.6867 8.5389 13.0161 8.49951 13.3062C8.4637 13.5962 8.41715 13.8433 8.35986 14.0474C8.30257 14.255 8.23991 14.4126 8.17188 14.52C8.10742 14.6274 8.04834 14.6812 7.99463 14.6812C7.94092 14.6812 7.88184 14.6257 7.81738 14.5146C7.75293 14.4072 7.69027 14.2515 7.62939 14.0474C7.5721 13.8433 7.52376 13.5962 7.48438 13.3062C7.44857 13.0161 7.43066 12.6867 7.43066 12.3179V7.26904C7.12988 7.18669 6.86133 7.04704 6.625 6.8501C6.39225 6.64958 6.20785 6.40967 6.07178 6.13037C5.93929 5.84749 5.87305 5.54313 5.87305 5.21729ZM7.3877 5.33545C7.58822 5.33545 7.76009 5.26383 7.90332 5.12061C8.04655 4.9738 8.11816 4.80192 8.11816 4.60498C8.11816 4.40804 8.04655 4.23796 7.90332 4.09473C7.76009 3.9515 7.58822 3.87988 7.3877 3.87988C7.19434 3.87988 7.02425 3.9515 6.87744 4.09473C6.73421 4.23796 6.6626 4.40804 6.6626 4.60498C6.6626 4.80192 6.73421 4.9738 6.87744 5.12061C7.02425 5.26383 7.19434 5.33545 7.3877 5.33545Z"
                  fill="var(--surface_bg_dark)"
                />
              </svg>
              <p className="text-typeface_primary text-body-medium">
                Learning Center Name
              </p>
            </div>
            <p className="text-typeface_secondary text-body-regular">
              Room 356
            </p>
            <Button className="bg-surface_bg_secondary text-typeface_primary text-body-semibold-cap-height">
              Get directions
            </Button>
          </div>
        </div>
        <div className="session-buttons flex items-center gap-[16px]">
          <InfoPill text="Starts in 2 days" />
          <div className="flex items-center gap-[12px]">
            <Button className="bg-white text-typeface_primary outline-action_border_primary text-body-semibold-cap-height">
              I can't attend
            </Button>
            <Button className="bg-action_bg_primary text-white text-body-semibold-cap-height">
              Confirm
            </Button>
            <DropDownSelector
              selectedButtonStyling="drop-shadow-md"
              selected="RSVP"
              allOptions={["RSVP", "other"]}
            />
          </div>
        </div>
      </div>
      <div className="session_cards flex flex-col gap-[16px]">
        <InfoCard className="stat-info-card">
          <ClassStats svgBgColor="surface_bg_secondary" />
        </InfoCard>
        <div className="grid w-full min-w-full grid-cols-5 gap-[16px]">
          <div className="col-span-2">
            <InfoCard className="overview-card min-h-[300px]">
              <div className="flex flex-col gap-[24px]">
                <h1 className="text-typeface_primary text-h3">Overview</h1>
                <p className="text-typeface_secondary text-body-regular">
                  Plan and deliver engaging lessons that integrate listening,
                  speaking, reading,and writing activities, tailored to
                  students' proficiency levels, and include clear objectives,
                  interactive exercises, and regular assessments to monitor
                  progress.
                </p>
              </div>
            </InfoCard>
          </div>
          <div className="col-span-3">
            <InfoCard
              className="class-lineup-card min-h-[300px] cursor-pointer"
              onClick={handlePopUp}
            >
              <div className="flex flex-col gap-[24px]">
                <h1 className="text-typeface_primary text-h3">
                  Class Schedule
                </h1>
                <div className="flex flex-col gap-[12px]">
                  <ClassItem
                    exerciseTitle="Grammar Conjugation"
                    time="10:00 - 10:15"
                  />
                  <ClassItem
                    exerciseTitle="Grammar Conjugation"
                    time="10:15 - 10:30"
                  />
                  <ClassItem
                    exerciseTitle="Grammar Conjugation"
                    time="10:30 - 10:45"
                  />
                  <ClassItem
                    exerciseTitle="Grammar Conjugation"
                    time="10:45 - 11:00"
                  />
                </div>
              </div>
            </InfoCard>
          </div>
        </div>
      </div>
    </div>
  );
}
