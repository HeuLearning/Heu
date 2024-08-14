import InfoPill from "./InfoPill";
import Button from "./Button";
import InfoCard from "./InfoCard";
import ClassItem from "./ClassItem";
import ClassStats from "./ClassStats";
import Placeholder from "./Placeholder";
import { useResponsive } from "./ResponsiveContext";
import { useSessions } from "./SessionsContext";
import {
  format,
  isSameDay,
  differenceInDays,
  differenceInMilliseconds,
} from "date-fns";
import { useLessonPlan } from "./LessonPlanContext";
import { useEffect, useState } from "react";
import RSVPSelector from "./RSVPSelector";
import { useRouter } from "next/router";

export default function SessionDetailContent({
  sessionId,
  handleShowClassSchedule,
  className = "",
  lessonPlanData,
  isLessonPlanLoaded,
}) {
  // sessionId will be passed in, either as activeSessionId (from SessionDetailSingle) or whichever tab is clicked from SessionDetailTabs
  // if it is null then placeholder
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { upcomingSessions, allSessions, getSessionStatus } = useSessions();
  const { phases, getModules, phaseTimes, lessonPlan } = lessonPlanData;

  let session;
  let startDate;
  let endDate;

  if (sessionId) {
    session = allSessions.find((session) => session.id === sessionId);
    startDate = new Date(session.start_time);
    endDate = new Date(session.end_time);
  }

  const differenceInDaysToStart = Math.round(
    differenceInMilliseconds(startDate, new Date()) / (24 * 60 * 60 * 1000)
  );
  const isUpcoming = differenceInDaysToStart < 14 && endDate > new Date();

  console.log("isLessonPlanLoaded", isLessonPlanLoaded);

  const router = useRouter();

  const handleEnter = () => {
    router.push("/instructor/" + sessionId);
  };

  return (
    <div
      id="session-detail-view"
      className={`${
        isMobile ? "gap-[24px]" : "justify-between"
      } relative flex h-full w-full flex-col ${className}`}
    >
      <div
        className={`session-info flex items-start justify-between ${
          isMobile ? "flex-col gap-[12px] px-[8px]" : ""
        }`}
      >
        <div className="session-title space-y-[16px]">
          <div className="date-title space-y-[10px]">
            <h1 className="text-typeface_primary leading-cap-height text-h1">
              {sessionId ? (
                format(startDate, "eeee, MMMM do")
              ) : (
                <Placeholder width={244} height={16} />
              )}
            </h1>
            <h1 className="text-typeface_secondary leading-tight text-h1">
              {sessionId ? (
                format(startDate, "h:mma") + " - " + format(endDate, "h:mma")
              ) : (
                <Placeholder width={208} height={16} />
              )}
            </h1>
          </div>
          <div className="flex items-center gap-[12px]">
            <div className="flex items-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0.8 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.87305 4.21729C5.87305 3.8234 5.96794 3.46533 6.15771 3.14307C6.34749 2.8208 6.60173 2.56478 6.92041 2.375C7.24268 2.18164 7.60075 2.08496 7.99463 2.08496C8.39209 2.08496 8.75016 2.18164 9.06885 2.375C9.39111 2.56478 9.64714 2.8208 9.83691 3.14307C10.0267 3.46533 10.1216 3.8234 10.1216 4.21729C10.1216 4.54313 10.0535 4.84749 9.91748 5.13037C9.78141 5.40967 9.59521 5.64958 9.35889 5.8501C9.12256 6.05062 8.85579 6.19027 8.55859 6.26904V11.3179C8.55859 11.6867 8.5389 12.0161 8.49951 12.3062C8.4637 12.5962 8.41715 12.8433 8.35986 13.0474C8.30257 13.255 8.23991 13.4126 8.17188 13.52C8.10742 13.6274 8.04834 13.6812 7.99463 13.6812C7.94092 13.6812 7.88184 13.6257 7.81738 13.5146C7.75293 13.4072 7.69027 13.2515 7.62939 13.0474C7.5721 12.8433 7.52376 12.5962 7.48438 12.3062C7.44857 12.0161 7.43066 11.6867 7.43066 11.3179V6.26904C7.12988 6.18669 6.86133 6.04704 6.625 5.8501C6.39225 5.64958 6.20785 5.40967 6.07178 5.13037C5.93929 4.84749 5.87305 4.54313 5.87305 4.21729ZM7.3877 4.33545C7.58822 4.33545 7.76009 4.26383 7.90332 4.12061C8.04655 3.9738 8.11816 3.80192 8.11816 3.60498C8.11816 3.40804 8.04655 3.23796 7.90332 3.09473C7.76009 2.9515 7.58822 2.87988 7.3877 2.87988C7.19434 2.87988 7.02425 2.9515 6.87744 3.09473C6.73421 3.23796 6.6626 3.40804 6.6626 3.60498C6.6626 3.80192 6.73421 3.9738 6.87744 4.12061C7.02425 4.26383 7.19434 4.33545 7.3877 4.33545Z"
                  fill={
                    sessionId
                      ? "var(--typeface_primary)"
                      : "var(--surface_bg_secondary)"
                  }
                />
              </svg>
              <p className="text-typeface_primary text-body-medium">
                {sessionId ? (
                  session.learning_organization_name +
                  ", " +
                  session.location_name
                ) : (
                  <Placeholder width={144} height={10} />
                )}
              </p>
            </div>
            <p className="text-typeface_secondary text-body-regular">
              {sessionId ? "Room #" : <Placeholder width={64} height={10} />}
            </p>
            {isMobile ? null : (
              <Button
                className={sessionId ? "button-tertiary" : "button-disabled"}
              >
                Get directions
              </Button>
            )}
          </div>
        </div>
        <div className="session-buttons flex items-center gap-[16px] pr-[14px]">
          {sessionId &&
          getSessionStatus(session) !== "Online" &&
          getSessionStatus(session) !== "Canceled" &&
          isUpcoming ? (
            <InfoPill
              icon={true}
              text={
                differenceInDaysToStart === 0
                  ? "Starts today"
                  : `Starts in ${differenceInDaysToStart} day${
                      differenceInDaysToStart > 1 ? "s" : ""
                    }`
              }
            />
          ) : null}
          {isMobile ? null : session ? (
            getSessionStatus(session) === "Online" ? (
              <Button className="button-primary" onClick={handleEnter}>
                Enter class
              </Button>
            ) : new Date(session.end_time) < new Date() ? null : (
              <RSVPSelector session={session} />
            )
          ) : null}
        </div>
      </div>
      <div
        className={`session_cards flex flex-col ${
          isMobile ? "gap-[24px]" : "gap-[16px]"
        } `}
      >
        <InfoCard className="stat-info-card">
          {sessionId ? (
            <ClassStats
              svgBgColor="surface_bg_secondary"
              attending="80/120"
              level="C1"
              agenda="Target"
              classCode="7FJR92"
            />
          ) : (
            <ClassStats
              svgBgColor="surface_bg_secondary"
              attending="-"
              level="-"
              agenda="-"
              classCode="-"
            />
          )}
        </InfoCard>
        <div
          className={`${
            isMobile
              ? "flex flex-col gap-[24px]"
              : "grid h-full min-h-[358px] w-full min-w-full flex-grow grid-cols-5 gap-[16px]"
          }`}
        >
          <div className={`${isMobile ? "" : "col-span-2 h-full w-full"}`}>
            <InfoCard className="overview-card h-full min-h-[300px] flex-grow">
              <div className="flex flex-col gap-[24px]">
                <h1 className="text-typeface_primary text-h3">Overview</h1>
                <p className="text-typeface_secondary text-body-regular">
                  {sessionId ? (
                    "Plan and deliver engaging lessons that integrate listening, speaking, reading,and writing activities, tailored to students' proficiency levels, and include clear objectives, interactive exercises, and regular assessments to monitor progress."
                  ) : (
                    <div className="flex flex-col gap-[14px]">
                      <Placeholder width={252} height={10} />
                      <Placeholder width={244} height={10} />
                      <Placeholder width={272} height={10} />
                      <Placeholder width={252} height={10} />
                      <Placeholder width={286} height={10} />
                      <Placeholder width={200} height={10} />
                    </div>
                  )}
                </p>
              </div>
            </InfoCard>
          </div>
          <div
            className={`${
              isMobile ? "" : "col-span-3 h-full w-full flex-grow"
            }`}
          >
            <InfoCard
              className="class-lineup-card h-full min-h-[300px] flex-grow cursor-pointer"
              onClick={handleShowClassSchedule}
            >
              <div className="flex flex-col gap-[24px]">
                <div className="flex items-center justify-between">
                  <h1 className="text-typeface_primary text-h3">
                    Class Schedule
                  </h1>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width="23"
                      height="23"
                      rx="5.5"
                      stroke="#EDEDED"
                    />
                    <path
                      d="M10.5 15.25L14 11.75L10.5 8.25"
                      stroke="#404040"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                </div>
                {sessionId && isLessonPlanLoaded !== "loading" ? (
                  isLessonPlanLoaded === "not confirmed instructor" ? (
                    <div>
                      You cannot see the lesson plan until you've confirmed the
                      session.
                    </div>
                  ) : isLessonPlanLoaded === "canceled session" ? (
                    <div>This session was canceled.</div>
                  ) : isLessonPlanLoaded === "no lesson plan" ? (
                    <div>No lesson plan yet</div>
                  ) : (
                    <div className="flex flex-col gap-[19px]">
                      {phases.map((phase) => (
                        <ClassItem
                          phaseTitle={phase.name}
                          time={phaseTimes.get(phase.id)}
                        />
                      ))}
                    </div>
                  )
                ) : (
                  <div className="flex flex-col gap-[26px]">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex justify-between">
                        <Placeholder width={160} height={10} />
                        <Placeholder width={88} height={10} />
                      </div>
                    ))}
                    <div className="flex justify-between">
                      <Placeholder width={44} height={10} />
                      <Placeholder width={44} height={10} />
                    </div>
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div key={index} className="flex justify-between">
                        <Placeholder width={160} height={10} />
                        <Placeholder width={88} height={10} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </InfoCard>
          </div>
        </div>
      </div>
    </div>
  );
}
