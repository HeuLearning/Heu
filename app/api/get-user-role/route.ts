import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();

  // Check for session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  // If there is no session or an error occurred, return 401
  if (sessionError || !session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Fetch the user's role
  const { data: rolesData, error: rolesError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", session.user.id)
    .single();

  // Handle errors when fetching role
  if (rolesError) {
    return NextResponse.json({ error: "Failed to fetch role" }, { status: 500 });
  }

  // Return the role if everything is fine
  return NextResponse.json({ role: rolesData.role }, { status: 200 });
}
