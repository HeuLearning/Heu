"use client";

import { FormMessage, Message } from "@/components/form-message";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SignUpRegistrationComponent from "@/components/all/SignUpRegistrationComponent";

export default function SignUp({ searchParams }: { searchParams: Message }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const checkSignedIn = async () => {
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setIsSignedIn(false);
        setIsLoading(false);
        return;
      }

      const user = session.user;

      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (rolesData) {
        switch (rolesData?.role) {
          case "ad":
            return router.push("/admin/dashboard");
          case "in":
            return router.push("/instructor/dashboard");
          case "st":
            return router.push("/learner/dashboard");
        }
      } else {
        setIsSignedIn(false);
        setIsLoading(false);
      }
    };

    checkSignedIn();
  }, []);

  if (isLoading) {
    return <div></div>;
  }

  return isSignedIn ? null : <SignUpRegistrationComponent />;
}
