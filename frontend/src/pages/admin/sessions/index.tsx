import Head from "next/head";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect } from "react";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";
import { useRouter } from "next/router";
import { Session } from "../../../../models/session";
import { string } from "zod";
import { LocationSearching } from "@mui/icons-material";

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
          learning_organization: "",
          locations: [],
          sessionToken: session.accessToken || null,
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
      "http://localhost:8000/api/admin-sessions",
      sessionOptions
    );
    const sessionData: {
      learning_organization: string;
      locations: { locaion: string; sesssions: Session[] };
    } = await sessionResponse.json();
    console.log(sessionData);
    return {
      props: {
        role: roleType || null,
        learning_organization: sessionData.learning_organization || "",
        locations: sessionData.locations || [],
        sessionToken: session.accessToken || null,
      },
    };
  },
});

export default function Sessions({
  role,
  learning_organization,
  locations,
  sessionToken,
}) {
  console.log(locations);
  const router = useRouter();

  const refreshData = () => {
    router.replace(router.asPath);
  };

  async function handleLocationSessions(locationId) {
    router.push(`/admin/sessions/${locationId}`);
  }

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
<<<<<<< Updated upstream:frontend/src/pages/admin/sessions.tsx

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
      <div>{organization}</div>
      <div>
        {sessions.map((session, index) => (
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
              {session.location}
            </h1>
            <h2>
              Enrolled: {session.num_enrolled}/{session.max_capacity}
            </h2>
            <h2>Waitlist: {session.num_waitlist}</h2>
            <button onClick={() => handleDelete(session.id)}>
              Delete Session
            </button>
          </div>
        ))}
      </div>
    </>
  );
=======
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
        <a href="/admin">
          <button>Back to admin dashboard</button>
        </a>

        <h2>Your learning organization: {learning_organization}</h2>
        <div>
          {locations.map((location, index) => (
            <div key={index}>
              <button
                onClick={() => handleLocationSessions(location.location.id)}
              >
                {location.location.name}
              </button>
            </div>
          ))}
        </div>
      </>
    );
>>>>>>> Stashed changes:frontend/src/pages/admin/sessions/index.tsx
}
