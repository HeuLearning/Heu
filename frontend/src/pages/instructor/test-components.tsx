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
import AudioButton from "components/exercise/AudioButton";
import AudioPlayer from "components/exercise/AudioPlayer";

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
  const [testAudioSelection, setAudioSelection] = useState(false);

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
              <h1 className="mb-8 rounded-[10px] font-medium tracking-[-0.02em] text-[#292929] text-[18px] leading-[22px]">
                Test Class Mode Content
              </h1>
              <section className="mb-12">
                <h2 className="mb-4 rounded-[10px] font-semibold tracking-[-0.02em] text-[#292929] text-[14px] leading-[16.94px]">
                  Q&A Fill in the Blank Exercise
                </h2>
                <button
                  onClick={() => setTestQAFillInTheBlank(!testQAFillInTheBlank)}
                  className="mb-4 h-[32px] rounded-[10px] bg-[#292929] px-4 py-2 tracking-[-0.02em] text-[#FFFFFF] transition-colors text-[14px] leading-[16.94px] hover:bg-blue-600"
                >
                  {testQAFillInTheBlank ? "Hide" : "Show"} Q&A Fill In The Blank
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
                <h2 className="mb-4 rounded-[10px] font-semibold tracking-[-0.02em] text-[#292929] text-[14px] leading-[16.94px]">
                  Fill in the Blank Exercise
                </h2>
                <button
                  onClick={() => setTestFillInTheBlank(!testFillInTheBlank)}
                  className="mb-4 h-[32px] rounded-[10px] bg-[#292929] px-4 py-2 tracking-[-0.02em] text-[#FFFFFF] transition-colors text-[14px] leading-[16.94px] hover:bg-blue-600"
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
                <h2 className="mb-4 rounded-[10px] font-semibold tracking-[-0.02em] text-[#292929] text-[14px] leading-[16.94px]">
                  Matching Exercise
                </h2>
                <button
                  onClick={() => setTestMatching(!testMatching)}
                  className="mb-4 h-[32px] rounded-[10px] bg-[#292929] px-4 py-2 tracking-[-0.02em] text-[#FFFFFF] transition-colors text-[14px] leading-[16.94px] hover:bg-blue-600"
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
              <section>
                <h2 className="mb-4 rounded-[10px] font-semibold tracking-[-0.02em] text-[#292929] text-[14px] leading-[16.94px]">
                  Multiple Selection Exercise
                </h2>
                <button
                  onClick={() => setAudioSelection(!testAudioSelection)}
                  className="mb-4 h-[32px] rounded-[10px] bg-[#292929] px-4 py-2 tracking-[-0.02em] text-[#FFFFFF] transition-colors text-[14px] leading-[16.94px] hover:bg-blue-600"
                >
                  {testAudioSelection ? "Hide" : "Show"} Multiple Selection Test
                </button>
                {testAudioSelection && (
                  <div className="rounded border p-4 shadow-md">
                    <div className="h-[500px] overflow-auto bg-white">
                      <ClassModeContent
                        activeModuleIndex={0}
                        activeModule={activeModule}
                        testAudioSelection={true}
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
