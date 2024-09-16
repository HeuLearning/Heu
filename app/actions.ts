// app/actions/authActions.ts

"use server";

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { encodedRedirect } from "@/utils/utils";
import { setCookie } from "nookies";

// Sign-Up Action
export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const phoneNumber = formData.get("phoneNumber") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const role = formData.get("role") as string;

  const supabase = createClient();
  const origin = headers().get("origin");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from("users").insert([
    {
      id: user?.id,
      role: user?.user_metadata.role,
      email: email,
      phone_number: phoneNumber,
      first_name: firstName,
      last_name: lastName,
    },
  ]);


  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

// Sign-In Action
export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return redirect("/sign-in");
  }

  const user = session.user;

  const { data: rolesData, error: rolesError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  setCookie(null, "session", session.access_token, {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  console.log(rolesData?.role);
  switch (rolesData?.role) {
    case "ad":
      return redirect("/admin/dashboard");
    case "in":
      return redirect("/instructor/dashboard");
    case "st":
      return redirect("/learner/dashboard");
    default:
      console.log(rolesData?.role);
      return redirect("/role-sign-up"); // Redirect to role sign up
  }
};

// Forgot Password Action
export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = createClient();
  const origin = headers().get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

// Reset Password Action
export const resetPasswordAction = async (formData: FormData) => {
  const supabase = createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  return encodedRedirect(
    "success",
    "/protected/reset-password",
    "Password updated",
  );
};

// Sign-Out Action
export const signOutAction = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
