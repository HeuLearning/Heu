import RadioButton from "../exercises/RadioButton";
import Divider from "./Divider";
import Textbox from "../exercises/Textbox";
import Button from "./buttons/Button";
import { useState } from "react";
import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface SignInRegistrationComponentProps {
  className?: string;
}

export default function SignInRegistrationComponent({
  className = "",
}: SignInRegistrationComponentProps) {
  const [signUpStage, setSignUpStage] = useState(0);

  // <form className="flex-1 flex flex-col min-w-64">
  //     <h1 className="text-2xl font-medium">Sign in</h1>
  //     <p className="text-sm text-foreground">
  //       Don't have an account?{" "}
  //       <Link className="text-foreground font-medium underline" href="/sign-up">
  //         Sign up
  //       </Link>
  //     </p>
  //     <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
  //       <Label htmlFor="email">Email</Label>
  //       <Input name="email" placeholder="you@example.com" required />
  //       <div className="flex justify-between items-center">
  //         <Label htmlFor="password">Password</Label>
  //         <Link
  //           className="text-xs text-foreground underline"
  //           href="/forgot-password"
  //         >
  //           Forgot Password?
  //         </Link>
  //       </div>
  //       <Input
  //         type="password"
  //         name="password"
  //         placeholder="Your password"
  //         required
  //       />
  //       <SubmitButton pendingText="Signing In..." formAction={signInAction}>
  //         Sign in
  //       </SubmitButton>
  //       <FormMessage message={searchParams} />
  //     </div>
  //   </form>

  const renderContent = () => {
    return (
      <div className="flex flex-col gap-[24px]">
        <h3 className="py-[3px] text-h3">Sign in to Heu Learning</h3>
        <form
          className="flex flex-col gap-[24px]"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            signInAction(formData);
          }}
        >
          <div className="flex flex-col gap-[12px]">
            <Textbox
              name="email"
              size="small"
              width="324"
              value=""
              placeholder="Email"
              required={true}
              onChange={() => {}}
            />
            <Textbox
              name="password"
              size="small"
              width="324"
              value=""
              placeholder="Password"
              onChange={() => {}}
              required={true}
              password={true}
            />
          </div>
          <Button className="button-primary self-start">Sign In</Button>
          <div className="relative">
            <Divider spacing={8} />
            <span className="absolute left-[28px] top-[-4px] bg-white px-[6px] text-typeface_secondary text-body-regular">
              or
            </span>
          </div>
          <Button className="button-tertiary self-start">
            <div className="flex items-center gap-[6px]">
              <div className="p-[2px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="12"
                  viewBox="0 0 24 24"
                  width="12"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
              </div>
              Continue with Google
            </div>
          </Button>
        </form>
        <Divider spacing={0} />
        <div className="flex items-center gap-[8px]">
          <p className="text-typeface_primary text-body-regular">
            Don't have an account?
          </p>
          <a
            href="/sign-up"
            className="text-typeface_primary text-body-semibold"
          >
            Sign up
          </a>
        </div>
      </div>
    );
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div
        className={`inset-0 z-[50] ${className} flex ${
          signUpStage === 0 ? "w-[372px]" : ""
        } ${
          signUpStage === 1 ? "w-[468px]" : ""
        } flex-col rounded-[20px] bg-white p-[24px] shadow-200 outline-surface_border_tertiary`}
      >
        {renderContent()}
      </div>
    </div>
  );
}
