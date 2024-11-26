import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  const supabase = createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Get the authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return NextResponse.redirect(`${origin}/sign-in`);
  }

  // Fetch user roles from your data source
  let { data: rolesData, error: rolesError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (rolesError) {
    console.error("Error fetching roles:", rolesError);

    // Try to update user_id if the email exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("user_roles")
      .select("id")
      .eq("email", user.email)
      .single();

    if (existingUser) {
      const { error: updateError } = await supabase
        .from("user_roles")
        .update({ user_id: user.id })
        .eq("email", user.email);

      if (updateError) {
        console.error("Error updating user_id:", updateError);
      } else {
        // Fetch roles again after successful update
        ({ data: rolesData, error: rolesError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single());

        if (rolesError) {
          console.error("Error fetching updated roles:", rolesError);
        }
      }
    } else {
      console.error("No existing user found for email:", user.email);
    }
  }

  const validRoles = ["ad", "in", "st"];
  if (!rolesData?.role || !validRoles.includes(rolesData.role)) {
    console.error("Invalid or missing role for user:", user.id);
    return NextResponse.redirect(`${origin}/sign-in`);
  }

  // Redirect based on the user's role
  switch (rolesData.role) {
    case "ad":
      return NextResponse.redirect(`${origin}/admin/dashboard`);
    case "in":
      return NextResponse.redirect(`${origin}/instructor/dashboard`);
    case "st":
      return NextResponse.redirect(`${origin}/learner/dashboard`);
    default:
      return NextResponse.redirect(`${origin}/sign-in`);
  }
}
