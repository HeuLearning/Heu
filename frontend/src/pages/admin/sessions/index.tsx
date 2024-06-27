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
      locations: {
        location: { name: string; id: number };
        sesssions: Session[];
      };
    } = await sessionResponse.json();
    console.log(sessionData);
    console.log("hi");
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
        <a href="/admin">
          <button>Back to admin dashboard</button>
        </a>
        <h1>Your learning organization: {learning_organization}</h1>
        <div>
          {locations.map((location, index) => (
            <button
              key={index}
              onClick={() => handleLocationSessions(location.location.id)}
            >
              {location.location.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
