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
          applicants: null,
          sessionToken: null,
        },
      };
    }

    // if the user is verified then get the related sessions
    const applicantOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`, // Include the access token
      },
    };

    let applicantResponse = await fetch(
      `http://localhost:8000/api/instructor-applications-admin/${templateId}`,
      applicantOptions
    );
    const applicantData = await applicantResponse.json();
    console.log(applicantResponse);
    return {
      props: {
        role: roleType || null,
        applicants: applicantData || null,
        sessionToken: session.accessToken || null,
      },
    };
  },
});

export default function Sessions({ role, applicants, sessionToken }) {
  const router = useRouter();

  const refreshData = () => {
    router.replace(router.asPath);
  };
  console.log(applicants);

  async function handleChangeStatus(approved, instanceId) {
    const res = await fetch(
      `http://localhost:8000/api/instructor-applications-admin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`, // Include the access token
        },
        body: JSON.stringify({
          instance_id: instanceId,
          approved: approved,
        }),
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
            Instructor Applications for {applicants.learning_organization} in{" "}
            {applicants.learning_organization_location}
          </h1>
          <h2>Application Template ID: {applicants.template_id}</h2>
          <h3>
            Application Link:{" "}
            <a href={applicants.google_form_link}>
              {applicants.google_form_link}
            </a>
          </h3>
          <h3>
            New:{" "}
            {applicants.unreviewed_instances.map((newApplicant) => (
              <div>
                {newApplicant.instructor_id}
                <button
                  onClick={() => handleChangeStatus(true, newApplicant.id)}
                >
                  Accept
                </button>
                <button
                  onClick={() => handleChangeStatus(false, newApplicant.id)}
                >
                  Reject
                </button>
              </div>
            ))}
          </h3>
          <h3>
            Accepted:{" "}
            {applicants.accepted_instances.map((acceptedApplicant) => (
              <div>
                {acceptedApplicant.instructor_id}
                <button
                  onClick={() =>
                    handleChangeStatus(false, acceptedApplicant.id)
                  }
                >
                  Reject
                </button>
              </div>
            ))}
          </h3>
          <h3>
            Rejected:{" "}
            {applicants.rejected_instances.map((rejectedApplicant) => (
              <div>
                {rejectedApplicant.instructor_id}
                <button
                  onClick={() => handleChangeStatus(true, rejectedApplicant.id)}
                >
                  Accept
                </button>
              </div>
            ))}
          </h3>
        </div>
      </>
    );
}
