import Head from "next/head";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect } from "react";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";
import { useRouter } from "next/router";
import { Session } from "../../../models/session";
import { string } from "zod";

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
          organization: "",
          sessions: [],
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
    const sessionData: { learning_organization: string; sessions: Session[] } =
      await sessionResponse.json();
    console.log(sessionResponse);
    return {
      props: {
        role: roleType || null,
        organization: sessionData.learning_organization || "",
        sessions: sessionData.sessions || [],
        sessionToken: session.accessToken || null,
      },
    };
  },
});

export default function Sessions({
  role,
  organization,
  sessions,
  sessionToken,
}) {
  console.log(sessions);
  const router = useRouter();

  const refreshData = () => {
    router.replace(router.asPath);
  };

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
        <form>
          <label htmlFor="fname">Start time:</label>
          <input type="text" id="fname" name="fname"></input>
          <label htmlFor="lname">End time:</label>
          <input type="text" id="lname" name="lname"></input>

          <input type="submit" value="Submit"></input>
        </form>
      </div>
    </>
  );
}