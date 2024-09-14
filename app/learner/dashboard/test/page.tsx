"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { redirect, useRouter } from "next/navigation";
import Head from "next/head";
import DashboardContainer from "../../../../components/all/DashboardContainer";
import { SessionsProvider } from "../../../../components/all/data-retrieval/SessionsContext";
import { UserRoleProvider } from "../../../../components/all/data-retrieval/UserRoleContext";
import { PopUpProvider } from "../../../../components/all/popups/PopUpContext";
import Navbar from "../../../../components/all/Navbar";
import EnhancedPopUp from "../../../../components/all/popups/EnhancedPopUp";
import { ResponsiveProvider } from "@/components/all/ResponsiveContext";
import ClassModeContent from "@/components/all/class-mode/ClassModeContent";
import ClassModeContainer from "@/components/all/class-mode/ClassModeContainer";
import { LessonPlanProvider } from "@/components/all/data-retrieval/LessonPlanContext";
import { StopwatchProvider } from "@/components/all/class-mode/StopwatchContext";

const Test = () => {
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!user || !session) {
        router.push("/sign-in");
        return;
      }

      const { data: roleType, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
        router.push("/error");
        return;
      }

      if (roleType?.role === "ad") {
        router.push("/admin/dashboard");
      } else if (roleType?.role === "in") {
        router.push("/instructor/dashboard");
      } else if (roleType?.role !== "st") {
        router.push("/sign-in");
      }

      setUserData({
        user: { email: user.email },
        role: roleType.role,
        accessToken: session.access_token,
      });
    };

    fetchUserData();
  }, [router]);

  if (!userData) return null; // or a loading state

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
        <ResponsiveProvider>
          <UserRoleProvider accessToken={userData.accessToken}>
            <SessionsProvider accessToken={userData.accessToken} userRole="st">
              <LessonPlanProvider
                sessionId={0}
                accessToken={userData.accessToken}
              >
                <PopUpProvider>
                  <Navbar activeTab="Dashboard" />
                  <StopwatchProvider>
                    <div>{/* insert here i guess */}</div>
                  </StopwatchProvider>
                  <EnhancedPopUp />
                </PopUpProvider>
              </LessonPlanProvider>
            </SessionsProvider>
          </UserRoleProvider>
        </ResponsiveProvider>
      </div>
    </>
  );
};

export default Test;
