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
import { useResponsive } from "./ResponsiveContext";
import MobileDetailView from "components/instructor/mobile/MobileDetailView";

export default function SessionDetailViewContainer() {
  const [dashboardHeight, setDashboardHeight] = useState(0);

  const { isMobile, isTablet, isDesktop } = useResponsive();

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

  if (isMobile) {
    return (
      <div>
        <MobileDetailView
          backgroundColor="bg-surface_bg_highlight"
          className="px-[16px] pt-[24px]"
        >
          <div className="flex items-center justify-between">
            <h3 className="p-[8px] text-typeface_primary text-h3">
              Class details
            </h3>
            <XButton onClick={""} />
          </div>
        </MobileDetailView>
      </div>
    );
  }

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
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.87305 4.21729C5.87305 3.8234 5.96794 3.46533 6.15771 3.14307C6.34749 2.8208 6.60173 2.56478 6.92041 2.375C7.24268 2.18164 7.60075 2.08496 7.99463 2.08496C8.39209 2.08496 8.75016 2.18164 9.06885 2.375C9.39111 2.56478 9.64714 2.8208 9.83691 3.14307C10.0267 3.46533 10.1216 3.8234 10.1216 4.21729C10.1216 4.54313 10.0535 4.84749 9.91748 5.13037C9.78141 5.40967 9.59521 5.64958 9.35889 5.8501C9.12256 6.05062 8.85579 6.19027 8.55859 6.26904V11.3179C8.55859 11.6867 8.5389 12.0161 8.49951 12.3062C8.4637 12.5962 8.41715 12.8433 8.35986 13.0474C8.30257 13.255 8.23991 13.4126 8.17188 13.52C8.10742 13.6274 8.04834 13.6812 7.99463 13.6812C7.94092 13.6812 7.88184 13.6257 7.81738 13.5146C7.75293 13.4072 7.69027 13.2515 7.62939 13.0474C7.5721 12.8433 7.52376 12.5962 7.48438 12.3062C7.44857 12.0161 7.43066 11.6867 7.43066 11.3179V6.26904C7.12988 6.18669 6.86133 6.04704 6.625 5.8501C6.39225 5.64958 6.20785 5.40967 6.07178 5.13037C5.93929 4.84749 5.87305 4.54313 5.87305 4.21729ZM7.3877 4.33545C7.58822 4.33545 7.76009 4.26383 7.90332 4.12061C8.04655 3.9738 8.11816 3.80192 8.11816 3.60498C8.11816 3.40804 8.04655 3.23796 7.90332 3.09473C7.76009 2.9515 7.58822 2.87988 7.3877 2.87988C7.19434 2.87988 7.02425 2.9515 6.87744 3.09473C6.73421 3.23796 6.6626 3.40804 6.6626 3.60498C6.6626 3.80192 6.73421 3.9738 6.87744 4.12061C7.02425 4.26383 7.19434 4.33545 7.3877 4.33545Z"
                  fill="var(--typeface_primary)"
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
            <Button className="button-secondary">I can't attend</Button>
            <Button className="button-primary">Confirm</Button>
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
