"use client";

import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import Head from "next/head";
import DashboardContainer from "../../../components/all/DashboardContainer";
import { SessionsProvider } from "../../../components/all/data-retrieval/SessionsContext";
import { UserRoleProvider } from "../../../components/all/data-retrieval/UserRoleContext";
import { PopUpProvider } from "../../../components/all/popups/PopUpContext";

import Navbar from "../../../components/all/Navbar";
import EnhancedPopUp from "../../../components/all/popups/EnhancedPopUp";
import { ResponsiveProvider } from "@/components/all/ResponsiveContext";


const fetchUserData = async () => {
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !session) {
    redirect("/sign-in");
  }

  const accessToken = session.access_token;

  const { data: roleType, error: rolesError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (rolesError) {
    console.error("Error fetching roles:", rolesError);
    redirect("/error");
  }

  if (roleType?.role === "ad") {
    redirect("/admin-dashboard");
  } else if (roleType?.role === "in") {
    redirect("/instructor-dashboard");
  } else if (roleType?.role !== "st") {
    redirect("/role-sign-up");
  }

  return {
    user: { email: user.email },
    role: roleType.role,
    accessToken,
  };
};

export default async function StudentDash() {
    const { user, role, accessToken } = await fetchUserData();
  
    return (
      <>
        <Head>
          <title>Heu Learning</title>
          <meta name="description" content="Teach more English better" />
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          <link rel="icon" href="/icon.ico" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
        </Head>
        <div>
          <ResponsiveProvider> {/* Wrap with ResponsiveProvider */}
            <UserRoleProvider accessToken={accessToken}>
              <SessionsProvider accessToken={accessToken} userRole="st">
                <PopUpProvider>
                  <Navbar activeTab="Dashboard"/>
                  <DashboardContainer accessToken={accessToken} />
                  <EnhancedPopUp />
                </PopUpProvider>
              </SessionsProvider>
            </UserRoleProvider>
          </ResponsiveProvider>
        </div>
      </>
    );
  }