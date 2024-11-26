"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { redirect, useRouter } from "next/navigation";
import Head from "next/head";
import DashboardContainer from "../../../components/all/DashboardContainer";
import { SessionsProvider } from "../../../components/all/data-retrieval/SessionsContext";
import { UserRoleProvider, useUserRole } from "../../../components/all/data-retrieval/UserRoleContext";
import { PopUpProvider } from "../../../components/all/popups/PopUpContext";
import Navbar from "../../../components/all/Navbar";
import EnhancedPopUp from "../../../components/all/popups/EnhancedPopUp";
import { ResponsiveProvider } from "@/components/all/ResponsiveContext";
import { getGT } from "gt-next";
import dictionary from "@/dictionary";
import Pusher from "pusher-js";

////////////////
import { useCallback } from "react";
///////////////


interface UserData {
  user: {
      email: string;
  };
  role: string;
  accessToken: string;
}

const InstructorDashboard = () => {
  const [userData, setUserData] = useState<UserData | null>(null); 
  const router = useRouter();
  const t = getGT();

  const courseId = '123'
  const eventId = 'ExerciseInfo'

  /////////////////
  // Button click handler (client-side)
  /*const handleButtonClick = useCallback(async (courseId: string, userId: string) => {
  console.log('handle button click pressed for courseId:', courseId);
  
  const response = await fetch("/api/pusher", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uid: uid,
      sessionId: sessionId,
    }),
  });

  if (!response.ok) {
    console.error(`Failed to retrieve session ${sessionId}`);
  }
}, []);*/

/*
const handleButtonClick = useCallback(async (courseId: string) => {
  console.log('handle button click pressed for course:', courseId);
  
  const response = await fetch("/api/pusher", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel: courseId,
      event: eventId,
      data: {
        userId: uid,
        timestamp: Date.now(),
        exerciseType: "practice",  // or whatever exercise type you're sending
        // Add any other exercise data here
      }
    }),
  })
  const data = await response.json();
  console.log(`data is ${JSON.stringify(data)}`);

  if (!response.ok) {
    console.error(`Failed to send exercise to course ${courseId}`);
  }
}, []);*/


////////////////

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
      } else if (roleType?.role === "st") {
        router.push("/learner/dashboard");
      } else if (roleType?.role !== "in") {
        router.push("/sign-in");
      }

      setUserData({
        user: { email: user.email || '' },
        role: roleType.role,
        accessToken: session.access_token,
      });
    
    };

    fetchUserData();


    ///PUSHER T
    const courseId = '123'; // Dynamic course ID from your context
    const pusher = new Pusher('4d40e9afa8517ca3683b', {
    cluster: 'us2',
    });

    // Create a course-specific channel
    const courseChannel = pusher.subscribe(courseId);
    courseChannel.bind(eventId, (data: any) => {
    console.log('Received course-specific exercise:', data);
    // Handle the exercise
    });

    // Cleanup function
    return () => {
    courseChannel.unbind_all();
    courseChannel.unsubscribe();
    };

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
            <SessionsProvider accessToken={userData.accessToken} userRole="in">
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

export default InstructorDashboard;
