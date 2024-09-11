"use client";

import { signInAction } from "@/app/actions";
import SignInRegistrationComponent from "@/components/all/SignInRegistrationComponent";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function Login({ searchParams }: { searchParams: Message }) {
  return <SignInRegistrationComponent />;
}
