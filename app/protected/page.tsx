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
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (rolesError) {
    console.error("Error fetching roles:", rolesError);
    return redirect("/role-sing-up"); // Redirect to an error page or handle it appropriately
  }

  const validRoles = ['ad', 'in', 'st'];  // Replace with your valid roles
  if (rolesData?.role == null || !validRoles.includes(rolesData.role)) {
    console.log("test")
    return redirect("/role-sign-up");  // Redirect to the role sign-up page
  }

  // Redirect based on the user's role
  switch (rolesData.role) {
    case 'ad':
      return redirect("/admin/dashboard");
    case 'in':
      return redirect("/instructor/dashboard");
    case 'st':
      return redirect("/learner/dashboard");
    default:
      return redirect("/role-sing-up"); // Redirect to an error page or handle it appropriately
  }
  
  // Fallback content (should not reach here due to redirects)
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4">Next steps</h2>
        <FetchDataSteps />
      </div>
    </div>
  );
}
