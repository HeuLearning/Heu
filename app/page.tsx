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
        router.push("/sign-in");
        return;
    }

    checkUserState();
  }, [router]);

  return (
    <>
      <main className="flex-1 flex flex-col gap-6 px-4">
      </main>
    </>
  );
}
