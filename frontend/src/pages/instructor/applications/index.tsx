import Head from "next/head";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect } from "react";
// import { useRouter } from 'next/router';
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";

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

    const locationOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`, // Include the access token
      },
    };

    let locationResponse = await fetch(
      "http://localhost:8000/api/instructor-applications-instructor",
      locationOptions
    );
    const locationData = await locationResponse.json();
    console.log(locationData);

    let instructorResponse = await fetch(
      "http://localhost:8000/api/instructor-applications-instructor",
      locationOptions
    );
    const instructorData = await instructorResponse.json();

    return {
      props: {
        role: roleType || null,
        locations: locationData || null,
        sessionToken: session.accessToken || null,
      },
    };
  },
});

export default function InstructorApplications({
  role,
  locations,
  sessionToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  console.log(role);

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
        {locations.active_templates.map((template, index) => (
          <div>
            <h1>{template.learning_organization_name}</h1>
            <h2>{template.learning_organization_location_name}</h2>
            {/* <a href={template.google_form_link} target="_blank">
              <h3>{template.google_form_link}</h3>
            </a> */}
            <a href={`/instructor/applications/${template.id}`}>
              <button>Apply</button>
            </a>
          </div>
        ))}
      </div>
    </>
  );
}
