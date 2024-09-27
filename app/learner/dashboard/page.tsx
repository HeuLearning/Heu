"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { redirect, useRouter } from "next/navigation";
import Head from "next/head";
import DashboardContainer from "../../../components/all/DashboardContainer";
import { SessionsProvider } from "../../../components/all/data-retrieval/SessionsContext";
import { UserRoleProvider } from "../../../components/all/data-retrieval/UserRoleContext";
import { PopUpProvider } from "../../../components/all/popups/PopUpContext";
import Navbar from "../../../components/all/Navbar";
import EnhancedPopUp from "../../../components/all/popups/EnhancedPopUp";
import { ResponsiveProvider } from "@/components/all/ResponsiveContext";
import { getGT } from "gt-next";
import dictionary from "@/dictionary";



interface UserData {
  user: {
      email: string;
  };
  role: string;
  accessToken: string;
}


const LearnerDashboard = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();

  const t = getGT();

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
        user: { email: user.email || '' },
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
              <PopUpProvider>
                <Navbar activeTab={t("button_content.dashboard")} />
                <DashboardContainer accessToken={userData.accessToken} />
                <EnhancedPopUp />
              </PopUpProvider>
            </SessionsProvider>
          </UserRoleProvider>
        </ResponsiveProvider>
      </div>
    </>
  );
};

export default LearnerDashboard;
