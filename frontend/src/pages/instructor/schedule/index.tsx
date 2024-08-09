import Head from "next/head";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useState } from "react";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { useRouter } from "next/router";


// type Session = {
//   id: number;
//   start_time: string;
//   end_time: string;
//   max_capacity: number;
//   num_enrolled: number;
//   num_waitlist: number;
//   learning_organization: string;
//   location: string;
//   approved: boolean;
//   viewed: boolean;
// };

// type Location = {
//   name: string;
//   id: number;
//   sessions: Session[];
// };

// type InstructorSessionsData = {
//   learning_organization: string;
//   locations: Location[];
// };

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const { req, res } = ctx;
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
        Authorization: `Bearer ${session.accessToken}`,
      },
    };

    const roleResponse = await fetch(
      "http://localhost:8000/api/get-user-role",
      options
    );
    const roleType = await roleResponse.json();
    const role = roleType.role;

    if (role === "ad") {
      return {
        redirect: {
          destination: "/admin",
          permanent: false,
        },
      };
    } else if (role === "st") {
      return {
        redirect: {
          destination: "/student",
          permanent: false,
        },
      };
    }

    // Fetch instructor sessions
    const sessionsResponse = await fetch(
      "http://localhost:8000/api/instructor-sessions",
      options
    );
    let sessionsData = await sessionsResponse.json();
    console.log(sessionsData.data);
    sessionsData.data = sessionsData.data.map(item => ({
      ...item,
      sessions: item.sessions.sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      )
    }));
    console.log(sessionsData[0]);
    return {
      props: {
        role: role || "unknown",
        sessionsData,
        token: session.accessToken,
      },
    };
  },
});

export default function InstructorHome({
  role,
  sessionsData,
  token
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  console.log(role);

  const router = useRouter();

  const refreshData = () => {
    router.replace(router.asPath);
  };

  async function handleChange(taskString, sessionId) {
    const res = await fetch(
      `http://localhost:8000/api/instructor-session-detail/${sessionId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the access token
        },
        body: JSON.stringify({ task: `${taskString}` }),
      }
    );

    if (res.status < 300) {
      refreshData();
    }
  }

  return (
    <>
      <Head>
        <title>Heu Learning - Instructor Schedule</title>
        <meta name="description" content="Teach more English better" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div>
        <h1>Instructor Schedule</h1>
        {sessionsData.data.map((sd) => (
          <div key={sd.id}>
            <h3>{sd.learning_org.name}, {sd.location.name}</h3>
            <ul>
              {sd.sessions.map((session) => (
                <li key={session.id}>
                  <p>Start Time: {new Date(session.start_time).toLocaleString()}</p>
                  <p>End Time: {new Date(session.end_time).toLocaleString()}</p>
                  <p>Max Capacity: {session.max_capacity}</p>
                  <p>Enrolled: {session.num_enrolled}</p>
                  <p>Waitlisted: {session.num_waitlist}</p>
                  <p>Approved: {session.approved ? 'Yes' : 'No'}</p>
                  <p>Viewed: {session.viewed ? 'Yes' : 'No'}</p>

                  {session.teaching &&  <button onClick={() => handleChange("drop", session.id)}>
                    Drop
                  </button> }
                  {!session.teaching &&  <button onClick={() => handleChange("teach", session.id)}>
                    Teach
                  </button>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}