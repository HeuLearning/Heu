"use client";

import Head from "next/head";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useState } from "react";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import Navbar from "components/all/Navbar";
import DashboardContainer from "components/all/DashboardContainer";
import { PopUpProvider } from "components/all/popups/PopUpContext";
import EnhancedPopUp from "components/all/popups/EnhancedPopUp";
import { useRouter } from "next/router";
import { useResponsive } from "components/all/ResponsiveContext";
import { SessionsProvider } from "components/all/data-retrieval/SessionsContext";
import dynamic from "next/dynamic";

export const getServerSideProps: GetServerSideProps = withPageAuthRequired({
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
        Authorization: `Bearer ${session.accessToken}`,
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
          destination: "/student",
          permanent: false,
        },
      };
    }

    return {
      props: {
        role: roleType || null,
        accessToken: session.accessToken || null,
      },
    };
  },
});

export default function InstructorHome({
  role,
  accessToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [mobile, setMobile] = useState(false);
  const [tablet, setTablet] = useState(false);
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMobile(isMobile);
      setTablet(isTablet);
      setDesktop(isDesktop);
    }, 0); // Adjust the timeout as needed

    return () => clearTimeout(timer);
  }, [isMobile, isTablet, isDesktop]);

  if (!mobile && !tablet && !desktop) {
    return <div></div>; // Loading state while calculating screen size
  }

  return (
    <>
      <Head>
        <title>Heu Learning</title>
        <meta name="description" content="Teach more English better" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <link rel="icon" href="/icon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div>
        <SessionsProvider accessToken={accessToken}>
          <PopUpProvider>
            <Navbar activeTab="Training" />
            <div>Training</div>
            <EnhancedPopUp />
          </PopUpProvider>
        </SessionsProvider>
      </div>
    </>
  );
}
