import Head from "next/head";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect } from "react";
// import { useRouter } from 'next/router';
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";
import { useRouter } from 'next/router';

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
        Authorization: `Bearer ${session.accessToken}`, // Include the access token
      },
    };

    const response = await fetch(
      "http://localhost:8000/api/get-user-role",
      options
    );
    const roleType = await response.json();
    console.log(roleType);
    const role = roleType.role;
    if (role === "ad") {
      return {
        redirect: {
          destination: "/admin",
          permanent: false,
        },
      };
    } else if (role === "in") {
      return {
        redirect: {
          destination: "/instructor",
          permanent: false,
        },
      };
    }

    // if the user is verified then get the related sessions
    const sessionOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`, // Include the access token
      },
    };

    let sessionResponse = await fetch(
      "http://localhost:8000/api/user-sessions",
      sessionOptions
    );
    sessionResponse = await sessionResponse.json();
    console.log(sessionResponse);
    return {
      props: {
        role: roleType || null,
        sessions: sessionResponse || null,
        sessionToken: session.accessToken || null,
      },
    };
  },
});

export default function Home({
  role,
  sessions,
  sessionToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  console.log(sessions);
  const sessions_data = Object.values(sessions);
  const router = useRouter();

  const refreshData = () => {
    router.replace(router.asPath);
  }

  async function handleChange(taskString, sessionId) {
    const res = await fetch(
      `http://localhost:8000/api/user-session-detail/${sessionId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`, // Include the access token
        },
        body: JSON.stringify({ "task": `${taskString}` }),
      }
    );

    if (res.status < 300) {
      refreshData();
    }
  };

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
        {sessions_data.map((session) => (
          <div key={session.index}>
            <h1>
              {session.start_time.substring(5, 7)}
              {"/"}
              {session.start_time.substring(8, 10)}
              {"/"}
              {session.start_time.substring(0, 4)}{" "}
              {session.start_time.substring(11, 16)}
              {" to "}
              {session.end_time.substring(11, 16)}
              {" at "}
              {session.organization}
              {" in "}
              {session.location}
            </h1>
            <h2>
              Enrolled: {session.num_enrolled}/{session.max_capacity}
            </h2>
            <h2>Waitlist: {session.num_waitlist}</h2>

            {session.num_enrolled < session.max_capacity ? (
              !session.isEnrolled ? (
                <button onClick={() => handleChange("enroll", session.id)}>Enroll</button>
              ) : (
                <div>
                  <h2>Already enrolled</h2>
                  <button onClick={() => handleChange("unenroll", session.id)}>Unenroll</button>
                </div>
              )
            ) : null}
            
            {session.num_enrolled >= session.max_capacity ? (
              !session.isWaitlisted ? (
                <button onClick={() => handleChange("waitlist", session.id)}>Join Waitlist</button>
              ) : (
                <div>
                  <h2>Already in waitlist</h2>
                  <button onClick={() => handleChange("drop_waitlist", session.id)}>Leave waitlist</button>
                </div>
              )
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}
