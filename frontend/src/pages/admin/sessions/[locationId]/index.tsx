import Head from "next/head";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect } from "react";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";
import { useRouter } from "next/router";
import { Session } from "../../../../../models/session";

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
          sessionToken: null,
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
      locations: { locaion: string; sesssions: Session[] };
    } = await sessionsResponse.json();
    return {
      props: {
        role: roleType || null,
        locationId: locationId || null,
        sessionsInfo: sessionsData || null,
        sessionToken: session.accessToken || null,
      },
    };
  },
});

export default function Sessions({
  role,
  locationId,
  sessionsInfo,
  sessionToken,
}) {
  const router = useRouter();

  const refreshData = () => {
    router.replace(router.asPath);
  };
  console.log(sessionsInfo);

  async function handleDelete(sessionId) {
    const res = await fetch(
      `http://localhost:8000/api/admin-session-detail/${sessionId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`, // Include the access token
        },
      }
    );

    if (res.status < 300) {
      refreshData();
    }
  }

  if (role.verified === false) {
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
        <div>You are currently unverified.</div>
      </>
    );
  } else
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
            Sessions for {sessionsInfo.learning_organization} in{" "}
            {sessionsInfo.location_name}
          </h1>
          <a href={`/admin/sessions/${locationId}/create-session`}>
            <button>Create Sessions</button>
          </a>
          <div>
            {sessionsInfo.sessions.map((session, index) => (
              <div key={index}>
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
                  {session.learning_organization}
                  {" in "}
                  {session.location_name}
                </h1>
                <h2>
                  Enrolled: {session.num_enrolled}/{session.max_capacity}
                </h2>
                <h2>Waitlist: {session.num_waitlist}</h2>
                {session.viewed ? (
                  session.approved ? (
                    <p>Approved</p>
                  ) : (
                    <p>Denied</p>
                  )
                ) : !session.approved ? (
                  <p>Pending Approval</p>
                ) : null}
                <button onClick={() => handleDelete(session.id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      </>
    );
}
