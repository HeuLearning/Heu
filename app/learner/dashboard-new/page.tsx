'use client'
import { UserRoleProvider } from "@/components/all/data-retrieval/UserRoleContext";
import MobileDashboard from "@/components/all/mobile/MobileDashboard";
import MobileNavbar from "@/components/all/MobileNavbar";
import EnhancedPopUp from "@/components/all/popups/EnhancedPopUp";
import { PopUpProvider } from "@/components/all/popups/PopUpContext";
import { ResponsiveProvider } from "@/components/all/ResponsiveContext";
import { createClient } from "@/utils/supabase/client";
import { access } from "fs";
import { getGT } from "gt-next";
import Head from "next/head";
import { useEffect, useState } from "react";

const LearnerDashboard = () => {
    const t = getGT();


    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(true);
    const [UID, setUID] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<"ad" | "in" | "st" | null>(null);
    const [preferredName, setPreferredName] = useState<string | null>(null);

    const [accessToken, setAccessToken] = useState<string | null>(null);


    useEffect(() => {
        // REFACTOR: it's weird how we have to fetch user data here, and then fetch it again from userRoleProvider.
        const fetchUserData = async () => {
            try {
                const { data: session, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error("Error fetching session:", sessionError);
                    setIsLoading(false);
                    return;
                }

                const userId = session.session?.user.id;
                setAccessToken(session.session?.access_token ?? null);

                if (!userId) {
                    setIsLoading(false);
                    return;
                }
                setUID(userId);


                const { data, error } = await supabase
                    .from("users_new")
                    .select("role, preferred_name")
                    .eq("uid", userId)
                    .single();

                if (error) {
                    console.error("Error fetching user data:", error);
                    setIsLoading(false);
                    return;
                }

                setUserRole(data?.role || null);
                setPreferredName(data?.preferred_name || null);
                setIsLoading(false);

            } catch (error) {
                console.error("Unexpected error:", error);
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (isLoading || !accessToken) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <>
            <div>
                <ResponsiveProvider>
                    <UserRoleProvider accessToken={accessToken}>
                        <PopUpProvider>
                            <MobileNavbar />  {/* When switching to learner desktop, make a single navbar component that functions for both role types and platforms. */}
                            <MobileDashboard accessToken={accessToken} />
                            <h1>Name: {preferredName}</h1>
                            <h1>Learner Dashboard</h1>
                            <EnhancedPopUp />
                        </PopUpProvider>
                    </UserRoleProvider>
                </ResponsiveProvider>

            </div>
        </>
    );
};

export default LearnerDashboard;