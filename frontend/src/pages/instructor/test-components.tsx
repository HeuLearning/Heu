"use client";

import Head from "next/head";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useState } from "react";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { PopUpProvider } from "components/instructor/PopUpContext";
import EnhancedPopUp from "components/instructor/EnhancedPopUp";
import { useResponsive } from "components/instructor/ResponsiveContext";
import ClassModeContent from "components/instructor/ClassModeContent";
import { StopwatchProvider } from "components/instructor/StopwatchContext";

export const getServerSideProps: GetServerSideProps = withPageAuthRequired({
  // ... (getServerSideProps implementation remains the same)
});

export default function InstructorHome({
  role,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [deviceType, setDeviceType] = useState<
    "mobile" | "tablet" | "desktop" | null
  >(null);
  const [testQAFillInTheBlank, setTestQAFillInTheBlank] = useState(false);
  const [testFillInTheBlank, setTestFillInTheBlank] = useState(false);
  const [testMatching, setTestMatching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isMobile) setDeviceType("mobile");
      else if (isTablet) setDeviceType("tablet");
      else if (isDesktop) setDeviceType("desktop");
    }, 0);

    return () => clearTimeout(timer);
  }, [isMobile, isTablet, isDesktop]);

  if (!deviceType) {
    return <div>Loading...</div>;
  }

  const activeModule = { name: "Instruction" };

  return (
    <>
      <Head>
        <title>Heu Learning - Instructor Dashboard</title>
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

      <PopUpProvider>
        <StopwatchProvider>
          <div className="min-h-screen bg-white">
            <main className="container mx-auto px-4 py-8">
              <h1 className="mb-8 bg-[#F2E5FD] font-bold text-typeface_primary text-4xl">
                Test Class Mode Content
              </h1>

              <section className="mb-12">
                <h2 className="mb-4 bg-[#F2E5FD] font-semibold text-3xl">
                  Q&A Fill in the Blank Exercise
                </h2>
                <button
                  onClick={() => setTestQAFillInTheBlank(!testQAFillInTheBlank)}
                  className="mb-4 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                >
                  {testQAFillInTheBlank ? "Hide" : "Show"} Fill In The Blank
                  Test
                </button>
                {testQAFillInTheBlank && (
                  <div className="rounded border p-4 shadow-md">
                    <div className="h-[500px] overflow-auto bg-white">
                      <ClassModeContent
                        activeModuleIndex={0}
                        activeModule={activeModule}
                        testQAFillInTheBlank={true}
                      />
                    </div>
                  </div>
                )}
              </section>

              <section className="mb-12">
                <h2 className="mb-4 bg-[#F2E5FD] font-semibold text-3xl">
                  Fill in the Blank Exercise
                </h2>
                <button
                  onClick={() => setTestFillInTheBlank(!testFillInTheBlank)}
                  className="mb-4 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                >
                  {testFillInTheBlank ? "Hide" : "Show"} Fill In The Blank Test
                </button>
                {testFillInTheBlank && (
                  <div className="rounded border p-4 shadow-md">
                    <div className="h-[500px] overflow-auto bg-white">
                      <ClassModeContent
                        activeModuleIndex={0}
                        activeModule={activeModule}
                        testFillInTheBlank={true}
                      />
                    </div>
                  </div>
                )}
              </section>

              <section>
                <h2 className="mb-4 bg-[#F2E5FD] font-semibold text-3xl">
                  Matching Exercise
                </h2>
                <button
                  onClick={() => setTestMatching(!testMatching)}
                  className="mb-4 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                >
                  {testMatching ? "Hide" : "Show"} Matching Test
                </button>
                {testMatching && (
                  <div className="rounded border p-4 shadow-md">
                    <div className="h-[500px] overflow-auto bg-white">
                      <ClassModeContent
                        activeModuleIndex={0}
                        activeModule={activeModule}
                        testMatchingExercise={true}
                      />
                    </div>
                  </div>
                )}
              </section>
            </main>
          </div>
          <EnhancedPopUp />
        </StopwatchProvider>
      </PopUpProvider>
    </>
  );
}
