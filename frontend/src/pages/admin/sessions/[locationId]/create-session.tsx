import Head from "next/head";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect } from "react";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";
import { useRouter } from "next/router";
import { Session } from "../../../../../models/session";
import { string } from "zod";
import SessionForm from "../../../../../components/SessionForm";
import { useState } from "react";
import { hasExternalOtelApiPackage } from "next/dist/build/webpack-config";

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const { req, res, query } = ctx;
    const { locationId } = query;
    const session = await getSession(req, res);

    if (!session) {
      return {
        redirect: {
          destination: "/api/auth/login",
          permanent: false,
        },
      };
    }

    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`, // Include the access token
      },
    };

    const response = await fetch(
      "http://localhost:8000/api/get-user-role",
      options
    );
    const roleType = await response.json();
    const role = roleType.role;
    if (role === "in") {
      return {
        redirect: {
          destination: "/instructor",
          permanent: false,
        },
      };
    } else if (role === "st") {
      return {
        redirect: {
          destination: "/learner",
          permanent: false,
        },
      };
    }
    // if verified then get schedules and stuff

    if (!roleType.verified) {
      return {
        props: {
          role: roleType || null,
          locationId: locationId || null,
          sessionsInfo: null,
          sessionRequirements: null,
          sessionToken: session.accessToken || null,
        },
      };
    }

    // if the user is verified then get the related sessions
    const sessionsOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`, // Include the access token
      },
    };

    let sessionsResponse = await fetch(
      `http://localhost:8000/api/admin-sessions-location/${locationId}`,
      sessionsOptions
    );
    const sessionsData: {
      learning_organization: string;
      location_name: string;
      sessions: Session[];
    } = await sessionsResponse.json();

    let sessionRequirementsResponse = await fetch(
      `http://localhost:8000/api/session-requirements/${locationId}`,
      sessionsOptions
    );
    const sessionRequirementsData = await sessionRequirementsResponse.json();
    console.log(sessionRequirementsData);
    console.log(sessionsData);

    return {
      props: {
        role: roleType || null,
        locationId: locationId || null,
        sessionsInfo: sessionsData || null,
        sessionRequirements: sessionRequirementsData || null,
        sessionToken: session.accessToken || null,
      },
    };
  },
});

export default function CreateSession({
  role,
  locationId,
  sessionsInfo,
  sessionRequirements,
  sessionToken,
}) {
  const [sessions, setSessions] = useState([]);
  const finalSessions = [];

  const addSessionForm = () => {
    setSessions([
      ...sessions,
      {
        index: 0,
        start_time: "",
        end_time: "",
      },
    ]);
  };

  const removeSessionForm = (index) => {
    const updatedSessions = sessions.filter((sessionForm, i) => i !== index);
    setSessions(updatedSessions);
  };

  const router = useRouter();

  const refreshData = () => {
    router.replace(router.asPath);
  };

  function getWeekNumber(date: Date): number {
    const yearStart = new Date(date.getFullYear(), 0, 1);
    const diff =
      (date.getTime() - yearStart.getTime()) / (7 * 24 * 60 * 60 * 1000);
    return Math.ceil(diff) + 1;
  }

  async function handleSubmitAll() {
    let dur = 0;
    const sessionTimes = new Set(); // keep track of  unique session times
    const sessionsPerWeekMap = new Map<number, number>(); // keep track of sessions per week
    let firstSessionDate = new Date();
    let lastSessionDate = new Date();

    sessions.forEach((session, index) => {
      const startDateString = session.date + "T" + session.start_time;
      const endDateString = session.date + "T" + session.end_time;
      const startDate = new Date(startDateString);
      const endDate = new Date(endDateString);

      if (endDate < startDate) {
        alert(`Session ${index + 1} end time is before start time`);
        return;
      }

      const durationHrs = (endDate.getTime() - startDate.getTime()) / 3600000;

      if (durationHrs < sessionRequirements.minimum_session_hours) {
        alert(
          `Session ${
            index + 1
          } duration is less than the minimum required hours. Please fix.`
        );
        return;
      }
      dur += durationHrs;
      const intervalKey = startDate + "_" + endDate;

      if (sessionTimes.has(intervalKey)) {
        alert(
          `Duplicate session time interval detected for session ${
            index + 1
          }. Please fix.`
        );
        return;
      } else {
        sessionTimes.add(intervalKey);
      }

      // Update first and last session dates
      if (startDate < firstSessionDate) {
        firstSessionDate = startDate;
      }
      if (endDate > lastSessionDate) {
        lastSessionDate = endDate;
      }

      const weekNumber = getWeekNumber(startDate);
      if (sessionsPerWeekMap.has(weekNumber)) {
        sessionsPerWeekMap.set(
          weekNumber,
          sessionsPerWeekMap.get(weekNumber) + 1
        );
      } else {
        sessionsPerWeekMap.set(weekNumber, 1);
      }
    });

    const lastDay = new Date(
      lastSessionDate.getFullYear(),
      lastSessionDate.getMonth(),
      lastSessionDate.getDate()
    );
    const firstDay = new Date(
      firstSessionDate.getFullYear(),
      firstSessionDate.getMonth(),
      firstSessionDate.getDate()
    );

    // calculate total span of days covered
    const daysCovered =
      (lastDay.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24);
    const weeksCovered = Math.ceil(daysCovered / 7);
    console.log(daysCovered + " " + weeksCovered);
    if (weeksCovered < sessionRequirements.minimum_num_weeks_consecutive) {
      alert(
        "The number of weeks covered by all sessions is less than the minimum required. Please fix."
      );
      return;
    }
    console.log("hello");
    console.log(weeksCovered);

    // sort weeks by most sessions to least
    const sortedWeeks = Array.from(sessionsPerWeekMap.values()).sort(
      (a, b) => b - a
    );
    console.log(sortedWeeks);
    // leave out exempt weeks
    const weeksToKeep = sortedWeeks.slice(
      0,
      sortedWeeks.length - sessionRequirements.num_exempt_weeks
    );
    // calculate num sessions to keep
    const numSessionsToKeep = weeksToKeep.reduce((acc, week) => {
      return acc + week;
    }, 0);

    // calculate avg sessions per week
    const sessionsPerWeek =
      numSessionsToKeep / (weeksCovered - sessionRequirements.num_exempt_weeks);

    console.log(sessionsPerWeek);

    if (sessionsPerWeek < sessionRequirements.minimum_avg_days_per_week) {
      alert(
        "The average number of sessions per week is less than the minimum required. Please fix."
      );
      return;
    }

    // if all checks pass, submit all sessions

    sessions.forEach((session, index) => {
      const startDateString = session.date + "T" + session.start_time;
      const endDateString = session.date + "T" + session.end_time;
      const startDate = new Date(startDateString);
      const endDate = new Date(endDateString);
      const formattedStartTime = formatDateForAPI(startDate);
      const formattedEndTime = formatDateForAPI(endDate);
      const sessionObject = {
        start_time: formattedStartTime,
        end_time: formattedEndTime,
      };
      finalSessions.push(sessionObject);
    });

    try {
      const res = await fetch(
        `http://localhost:8000/api/admin-sessions-location`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`, // Include the access token
          },
          body: JSON.stringify({
            session_requirement_id: sessionRequirements.requirement_id,
            sessions: finalSessions,
          }),
        }
      );

      if (res.status < 300) {
        refreshData();
        alert("All sessions have been successfully created.");
        router.push(`/admin/sessions/${locationId}`);
      }
    } catch (error) {
      console.error("Error creating sessions:", error);
      alert("Failed to create all sessions. Please try again.");
    }
  }

  function formatDateForAPI(date) {
    return date.toISOString().split(".")[0] + "Z";
  }

  return (
    <>
      <Head>
        <title>Heu Learning</title>
        <meta name="description" content="Teach more English better" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div>
        <h1>
          Create new sessions for {sessionsInfo.learning_organization} at{" "}
          {sessionsInfo.location_name}
        </h1>
        <h2>Location Requirements: </h2>
        <h3>
          - Each session must be {sessionRequirements.minimum_session_hours}{" "}
          hour(s) long
        </h3>
        <h3>
          - All sessions must be within{" "}
          {sessionRequirements.minimum_num_weeks_consecutive} weeks, not fewer
        </h3>
        <h3>
          - Sessions must meet for on average{" "}
          {sessionRequirements.minimum_avg_days_per_week} days per week with the
          exception of {sessionRequirements.num_exempt_weeks} weeks (mainly to
          account for holidays, etc.)
        </h3>
        {sessions.map((session, index) => (
          <div key={index}>
            <SessionForm
              key={index}
              index={index + 1}
              session={session}
              setSession={(updatedSession) => {
                const updatedSessions = [...sessions];
                updatedSessions[index] = updatedSession;
                setSessions(updatedSessions);
              }}
            />
            <button onClick={() => removeSessionForm(index)}>
              Remove Session
            </button>
          </div>
        ))}
      </div>
      <br></br>
      <button onClick={addSessionForm}>Add Another Session</button>
      <button onClick={handleSubmitAll}>Submit All Sessions</button>
    </>
  );
}
