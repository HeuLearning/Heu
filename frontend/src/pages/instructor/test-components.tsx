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
  const [testAudioWriting, setAudioWriting] = useState(false);
  const [testAudioTyping, setAudioTyping] = useState(false);

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

  const ExerciseWrapper = ({ children }) => (
    <div className="mx-auto w-[1100px] overflow-x-auto">{children}</div>
  );

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
            <main className="container mx-auto px-[16px] py-[32px]">
              <h1 className="mb-[32px] rounded-[10px] text-typeface_primary text-h3-desktop">
                Test Class Mode Content
              </h1>

              {/* Q&A Fill in the Blank Exercise */}
              <section className="mb-[48px]">
                <h2 className="mb-[16px] rounded-[10px] text-typeface_primary text-body-semibold-cap-height">
                  Q&A Fill in the Blank Exercise
                </h2>
                <button
                  onClick={() => setTestQAFillInTheBlank(!testQAFillInTheBlank)}
                  className="mb-[16px] h-[32px] rounded-[10px] bg-action_bg_primary px-[16px] py-[8px] text-typeface_highlight transition-colors text-body-semibold-cap-height hover:bg-action_bg_primary_hover"
                >
                  {testQAFillInTheBlank ? "Hide" : "Show"} Q&A Fill In The Blank
                  Test
                </button>
                {testQAFillInTheBlank && (
                  <ExerciseWrapper>
                    <div className="rounded border p-[16px] shadow-[0_2px_4px_rgba(0,0,0,0.07)]">
                      <div className="h-[500px] overflow-auto bg-white">
                        <ClassModeContent
                          activeModuleIndex={0}
                          activeModule={activeModule}
                          testQAFillInTheBlank={true}
                        />
                      </div>
                    </div>
                  </ExerciseWrapper>
                )}
              </section>

              {/* Fill in the Blank Exercise */}
              <section className="mb-[48px]">
                <h2 className="mb-[16px] rounded-[10px] text-typeface_primary text-body-semibold-cap-height">
                  Fill in the Blank Exercise
                </h2>
                <button
                  onClick={() => setTestFillInTheBlank(!testFillInTheBlank)}
                  className="mb-[16px] h-[32px] rounded-[10px] bg-action_bg_primary px-[16px] py-[8px] text-typeface_highlight transition-colors text-body-semibold-cap-height hover:bg-action_bg_primary_hover"
                >
                  {testFillInTheBlank ? "Hide" : "Show"} Fill In The Blank Test
                </button>
                {testFillInTheBlank && (
                  <ExerciseWrapper>
                    <div className="rounded border p-[16px] shadow-[0_2px_4px_rgba(0,0,0,0.07)]">
                      <div className="h-[500px] overflow-auto bg-white">
                        <ClassModeContent
                          activeModuleIndex={0}
                          activeModule={activeModule}
                          testFillInTheBlank={true}
                        />
                      </div>
                    </div>
                  </ExerciseWrapper>
                )}
              </section>

              {/* Matching Exercise */}
              <section className="mb-[48px]">
                <h2 className="mb-[16px] rounded-[10px] text-typeface_primary text-body-semibold-cap-height">
                  Matching Exercise
                </h2>
                <button
                  onClick={() => setTestMatching(!testMatching)}
                  className="mb-[16px] h-[32px] rounded-[10px] bg-action_bg_primary px-[16px] py-[8px] text-typeface_highlight transition-colors text-body-semibold-cap-height hover:bg-action_bg_primary_hover"
                >
                  {testMatching ? "Hide" : "Show"} Matching Test
                </button>
                {testMatching && (
                  <ExerciseWrapper>
                    <div className="rounded border p-[16px] shadow-[0_2px_4px_rgba(0,0,0,0.07)]">
                      <div className="h-[500px] overflow-auto bg-white">
                        <ClassModeContent
                          activeModuleIndex={0}
                          activeModule={activeModule}
                          testMatchingExercise={true}
                        />
                      </div>
                    </div>
                  </ExerciseWrapper>
                )}
              </section>

              {/* Multiple Selection Exercise */}
              <section className="mb-[48px]">
                <h2 className="mb-[16px] rounded-[10px] text-typeface_primary text-body-semibold-cap-height">
                  Multiple Selection Exercise
                </h2>
                <button
                  onClick={() => setAudioSelection(!testAudioSelection)}
                  className="mb-[16px] h-[32px] rounded-[10px] bg-action_bg_primary px-[16px] py-[8px] text-typeface_highlight transition-colors text-body-semibold-cap-height hover:bg-action_bg_primary_hover"
                >
                  {testAudioSelection ? "Hide" : "Show"} Multiple Selection Test
                </button>
                {testAudioSelection && (
                  <ExerciseWrapper>
                    <div className="rounded border p-[16px] shadow-[0_2px_4px_rgba(0,0,0,0.07)]">
                      <div className="h-[500px] overflow-auto bg-white">
                        <ClassModeContent
                          activeModuleIndex={0}
                          activeModule={activeModule}
                          testAudioSelection={true}
                        />
                      </div>
                    </div>
                  </ExerciseWrapper>
                )}
              </section>

              {/* Audio Writing Exercise */}
              <section className="mb-[48px]">
                <h2 className="mb-[16px] rounded-[10px] text-typeface_primary text-body-semibold-cap-height">
                  Audio Writing Exercise
                </h2>
                <button
                  onClick={() => setAudioWriting(!testAudioWriting)}
                  className="mb-[16px] h-[32px] rounded-[10px] bg-action_bg_primary px-[16px] py-[8px] text-typeface_highlight transition-colors text-body-semibold-cap-height hover:bg-action_bg_primary_hover"
                >
                  {testAudioWriting ? "Hide" : "Show"} Audio Writing Test
                </button>
                {testAudioWriting && (
                  <ExerciseWrapper>
                    <div className="rounded border p-[16px] shadow-[0_2px_4px_rgba(0,0,0,0.07)]">
                      <div className="h-[500px] overflow-auto bg-white">
                        <ClassModeContent
                          activeModuleIndex={0}
                          activeModule={activeModule}
                          testAudioWriting={true}
                        />
                      </div>
                    </div>
                  </ExerciseWrapper>
                )}
              </section>

              {/* Audio Typing Exercise */}
              <section className="mb-[48px]">
                <h2 className="mb-[16px] rounded-[10px] text-typeface_primary text-body-semibold-cap-height">
                  Audio Typing Exercise
                </h2>
                <button
                  onClick={() => setAudioTyping(!testAudioTyping)}
                  className="mb-[16px] h-[32px] rounded-[10px] bg-action_bg_primary px-[16px] py-[8px] text-typeface_highlight transition-colors text-body-semibold-cap-height hover:bg-action_bg_primary_hover"
                >
                  {testAudioTyping ? "Hide" : "Show"} Audio Typing Test
                </button>
                {testAudioTyping && (
                  <ExerciseWrapper>
                    <div className="rounded border p-[16px] shadow-[0_2px_4px_rgba(0,0,0,0.07)]">
                      <div className="h-[500px] overflow-auto bg-white">
                        <ClassModeContent
                          activeModuleIndex={0}
                          activeModule={activeModule}
                          testAudioTyping={true}
                        />
                      </div>
                    </div>
                  </ExerciseWrapper>
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
