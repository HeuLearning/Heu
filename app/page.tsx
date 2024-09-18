"use client";

import { createClient } from "../utils/supabase/client"; // Adjust path as needed
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Hero from "@/components/hero";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";

export default function Index() {
  const router = useRouter();

  const supabase = createClient();

  useEffect(() => {
    const checkUserState = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();


      if (!session) {
        return router.push("/sign-in");
      }

      const user = session.user;
      // Fetch user role
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user?.id)
        .single();

      if (rolesError || !rolesData || !rolesData.role) {
        console.error("Error fetching roles:", rolesError);
        return router.push("/sign-up");
      }

      const validRoles = ["ad", "in", "st"];
      if (!validRoles.includes(rolesData.role)) {
        return router.push("/sign-in");
      }

      // Redirect based on the user's role
      switch (rolesData?.role) {
        case "ad":
          return router.push("/admin/dashboard");
        case "in":
          return router.push("/instructor/dashboard");
        case "st":
          return router.push("/learner/dashboard");
        default:
          return router.push("/sing-in"); // Redirect to an error page or handle appropriately
      }
    };

    checkUserState();
  }, [router, supabase]);

  return (
    <>
      <main className="flex-1 flex flex-col gap-6 px-4">
      </main>
    </>
  );
}
