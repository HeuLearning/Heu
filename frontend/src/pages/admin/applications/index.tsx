import Head from "next/head";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect } from "react";
// import { useRouter } from 'next/router';
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";
import { useRouter } from "next/router";

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
          templates: null,
          sessionToken: null,
        },
      };
    }

    // if the user is verified then get the related sessions
    const applicationTemplates = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`, // Include the access token
      },
    };

    let templateResponse = await fetch(
      "http://localhost:8000/api/instructor-application-template",
      applicationTemplates
    );
    templateResponse = await templateResponse.json();
    console.log(templateResponse);
    return {
      props: {
        role: roleType || null,
        templates: templateResponse || null,
        sessionToken: session.accessToken || null,
      },
    };
  },
});

export default function Applications({
  role,
  templates,
  sessionToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  async function handleViewApplicants(templateId) {
    {
      router.push(`/admin/applications/${templateId}`);
    }
    // if (res.status < 300) {
    //   refreshData();
    // }
  }

  console.log(role);
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
      <div>
        {Object.entries(templates).map(([orgName, locations]) => (
          <div key={orgName}>
            <h1>Learning Organization: {orgName}</h1>
            {locations.map((location) => (
              <div key={location.id}>
                <h2>Applications for {location.location_name}</h2>
                {location.templates.map((template) => (
                  <div>
                    <h3>Application template ID: {template.id}</h3>
                    <h3>Status: {template.active ? "Active" : "Inactive"}</h3>
                    <p>
                      <a href={template.google_form_link}>Application Link</a>
                    </p>
                    <button onClick={() => handleViewApplicants(template.id)}>
                      View Applicants
                    </button>
                    <br />
                    <br />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
}
