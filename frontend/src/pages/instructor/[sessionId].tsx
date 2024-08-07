"use client";

import Head from "next/head";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useState, useRef } from "react";
// import { useRouter } from 'next/router';
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";
import Navbar from "components/instructor/Navbar";
import DashboardContainer from "components/instructor/DashboardContainer";
import { PopUpProvider } from "components/instructor/PopUpContext";
import EnhancedPopUp from "components/instructor/EnhancedPopUp";
import ClassModeContainer from "components/instructor/ClassModeContainer";
import { useRouter } from "next/router";
import { SessionsProvider } from "components/instructor/SessionsContext";
import { DndContext } from "@dnd-kit/core";

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const { req, res, query } = ctx;
    const { sessionId } = query;
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
          destination: "/student",
          permanent: false,
        },
      };
    }
    return {
      props: {
        role: role || "unknown",
        sessionId: sessionId || null,
        accessToken: session.accessToken || null,
      },
    };
  },
});

export default function InstructorHome({
  role,
  sessionId,
  accessToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  console.log(role);

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
          <DndContext>
            <PopUpProvider>
              <Navbar />
              <ClassModeContainer sessionId={sessionId} />
              <EnhancedPopUp />
            </PopUpProvider>
          </DndContext>
        </SessionsProvider>
      </div>
    </>
  );
}
