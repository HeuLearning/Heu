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
import AudioPlayer2 from "components/exercise/AudioPlayer-2";

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
        <PopUpProvider>
          <div className="bg-surface_bg_primary">
            <MobileDetailView
              backgroundColor="bg-surface_bg_highlight"
              className="px-[16px] pt-[24px]"
              headerContent={
                <div className="flex items-center gap-[12px]">
                  <h3 className="text-typeface_primary text-h3">
                    Class Schedule
                  </h3>
                </div>
              }
            >
              <div className="pb-[81px]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
                pellentesque auctor scelerisque. Quisque dictum nunc ut vehicula
                vehicula. Ut at mi eu nisi tempor vehicula non at lacus. Sed
                nunc nibh, finibus quis maximus ac, euismod a risus. Duis cursus
                id urna at gravida.erra massa vel tempor tempus. Nunc gravida
                cursus venenatis. Integer placerat eleifend nisi a commodo.
                Phasellus non fermentum leo, at posuere purus. Maecenas rhoncus
                pulvinar neque, et condimentum odio laoreet vitae. Nulla
                molestie dui vitae faucibus dapibus.
              </div>
              <AudioPlayer2
                audioSrc="https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg"
                title="Coffee Shop"
              ></AudioPlayer2>
            </MobileDetailView>
          </div>
          <EnhancedPopUp />
        </PopUpProvider>
      </div>
    </>
  );
}
