import Head from "next/head";
import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect } from "react";
// import { useRouter } from 'next/router';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import { withPageAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { getAccessToken } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation'

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const { req, res } = ctx;
    const session = await getSession(req, res);

    if (!session) {
      return {
        redirect: {
          destination: '/api/auth/login',
          permanent: false,
        },
      };
    }

    const options = {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.accessToken}`, // Include the access token
      },
    };

    const response = await fetch('http://localhost:8000/api/get-user-role', options);
    const roleType = await response.json();
    const role = roleType.role;
    if (role === "in") {
      return {
        redirect: {
          destination: '/instructor',
          permanent: false,
        },
      };
    } else if (role === "st") {
      return {
        redirect: {
          destination: '/learner',
          permanent: false,
        },
      };
    }
    // if verified then get schedules and stuff

    if (!roleType.verified) {
      return {
        props: {
          role: roleType || null,
          sessions: null,
        },
      };
    }

    // if the user is verified then get the related sessions
    const sessionOptions = {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.accessToken}`, // Include the access token
      },
    };

    let sessionResponse = await fetch('http://localhost:8000/api/admin-sessions', sessionOptions);
    sessionResponse = await sessionResponse.json();
    console.log(sessionResponse);
    return {
        props: {
          role: roleType || null,
          sessions: sessionResponse || null,
        },
      };
  }
});

export default function Sessions() {

}