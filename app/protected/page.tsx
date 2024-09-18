// app/protected-page/page.tsx

import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = createClient();

  // Get the authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to sign-in if user is not authenticated
  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user roles from your data source
  const { data: rolesData, error: rolesError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();


  if (rolesError) {
    console.error("Error fetching roles:", rolesError);
    console.log(user.id);

    const { data: existingUser, error: fetchError } = await supabase
    .from('user_roles')
    .select('id')
    .eq('email', user.email)
    .single();

    console.log("EXISTING USER")
    console.log(user.email)

    if (existingUser) {
      const { data: updateData, error: updateError } = await supabase
      .from('user_roles')
      .update({ user_id: user.id })
      .eq('email', user.email);

      console.log(updateError)
  
    }


  }



  const validRoles = ["ad", "in", "st"]; // Replace with your valid roles
  if (rolesData?.role == null || !validRoles.includes(rolesData.role)) {
    console.log("PROBLEM 1");
  }

  // Redirect based on the user's role
  switch (rolesData?.role) {
    case "ad":
      return redirect("/admin/dashboard");
    case "in":
      return redirect("/instructor/dashboard");
    case "st":
      return redirect("/learner/dashboard");
    default:

      return redirect("/sign-in"); // Redirect to an error page or handle it appropriately
  }

  // Fallback content (should not reach here due to redirects)
  return (
    <div className="flex w-full flex-1 flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-foreground flex items-center gap-3 rounded-md p-3 px-5 text-sm">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
        </div>
      </div>
      <div className="flex flex-col items-start gap-2">
        <h2 className="mb-4 font-bold text-2xl">Your user details</h2>
        <pre className="max-h-32 overflow-auto rounded border p-3 font-mono text-xs">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
      <div>
        <h2 className="mb-4 font-bold text-2xl">Next steps</h2>
        <FetchDataSteps />
      </div>
    </div>
  );
}
