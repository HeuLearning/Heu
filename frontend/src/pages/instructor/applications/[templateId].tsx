import Head from "next/head";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect } from "react";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";
import { useRouter } from "next/router";

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const { req, res, query } = ctx;
    const { templateId } = query;
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
          destination: "/learner",
          permanent: false,
        },
      };
    }

    // if the user is verified then get the related sessions
    const applicantionOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`, // Include the access token
      },
    };

    let applicationResponse = await fetch(
      `http://localhost:8000/api/instructor-application-instance/${templateId}`,
      applicantionOptions
    );
    const applicationData = await applicationResponse.json();
    console.log(applicationData);
    return {
      props: {
        role: roleType || null,
        application: applicationData || null,
        sessionToken: session.accessToken || null,
      },
    };
  },
});

export default function Application({ role, application, sessionToken }) {
  const router = useRouter();

  const refreshData = () => {
    router.replace(router.asPath);
  };

  async function handleSubmitApplication(instanceId) {
    const res = await fetch(
      `http://localhost:8000/api/instructor-application-instance/put/${instanceId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`, // Include the access token
        },
        body: JSON.stringify({
          completed: true,
        }),
      }
    );
    if (res.status < 300) {
      router.push("/instructor/applications");
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
        <h1>
          Instructor Application for {application.learning_organization_name} in{" "}
          {application.learning_organization_location_name}
        </h1>
        <a href={application.google_form_link}>
          {application.google_form_link}
        </a>
        <br></br>
        <button onClick={() => handleSubmitApplication(application.id)}>
          Mark as Submitted
        </button>
      </div>
    </>
  );
}
