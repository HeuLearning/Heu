"use client";

import Head from "next/head";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useState } from "react";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import Navbar from "components/instructor/Navbar";
import DashboardContainer from "components/instructor/DashboardContainer";
import { PopUpProvider } from "components/instructor/PopUpContext";
import EnhancedPopUp from "components/instructor/EnhancedPopUp";
import { useRouter } from "next/router";
import { useResponsive } from "components/instructor/ResponsiveContext";
import ButtonBar from "components/instructor/mobile/ButtonBar";
import MobileClassDetails from "components/instructor/mobile/MobileClassDetails";
import MobileDetailView from "components/instructor/mobile/MobileDetailView";
import AudioPlayer from "components/exercise/AudioPlayer";
import AudioPlayerMobile from "components/exercise/AudioPlayerMobile";
import ClassModeContent from "components/instructor/ClassModeContent";
import { StopwatchProvider } from "components/instructor/StopwatchContext";

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
        role: role || "unknown",
      },
    };
  },
});

export default function InstructorHome({
  role,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [mobile, setMobile] = useState(false);
  const [tablet, setTablet] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const [testFillInTheBlank, setTestFillInTheBlank] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMobile(isMobile);
      setTablet(isTablet);
      setDesktop(isDesktop);
    }, 0);

    return () => clearTimeout(timer);
  }, [isMobile, isTablet, isDesktop]);

  if (!mobile && !tablet && !desktop) {
    return <div></div>;
  }

  const activeModule = { name: "Instruction" };

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
        <PopUpProvider>
          <div className="bg-surface_bg_primary">
            <StopwatchProvider>
              <div className="px-[16px] pt-[24px]">
                <h3 className="text-typeface_primary text-h3">
                  Test Class Mode Content
                </h3>
                <button
                  onClick={() => setTestFillInTheBlank(!testFillInTheBlank)}
                  className="mb-4 rounded bg-blue-500 text-white hover:bg-blue-600"
                >
                  Toggle Fill In The Blank Test
                </button>
                <div className="h-[500px] bg-white">
                  <ClassModeContent
                    activeModuleIndex={0}
                    activeModule={activeModule}
                    testFillInTheBlank={testFillInTheBlank}
                  />
                </div>
              </div>
            </StopwatchProvider>
          </div>
          <EnhancedPopUp />
        </PopUpProvider>
      </div>
    </>
  );
}
