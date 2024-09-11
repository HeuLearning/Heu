import RadioButton from "../exercises/RadioButton";
import Divider from "./Divider";
import Textbox from "../exercises/Textbox";
import Button from "./buttons/Button";
import { useState } from "react";

interface SignUpRegistrationComponent {
  className?: string;
}

export default function SignUpRegistrationComponent({
  className = "",
}: SignUpRegistrationComponent) {
  const [signUpStage, setSignUpStage] = useState(0);

  const LogInSignUpPage = () => {
    return (
      <div className="flex flex-col gap-[24px]">
        <h3 className="py-[3px] text-h3">Create a Heu Learning account</h3>
        <div className="">
          <form className="flex flex-col gap-[24px]">
            <div className="space-y-[16px]">
              <RadioButton
                label="I want to learn English"
                name="accountType"
                className="gap-[10px]"
              />
              <RadioButton
                label="I want to teach English"
                name="accountType"
                className="gap-[10px]"
              />
            </div>
            <Divider spacing={8} />
            <Textbox
              name="email"
              size="small"
              width="324"
              value=""
              onChange={() => {}}
              placeholder="Email address"
            />
            <Button
              className="button-primary self-start"
              onClick={handleContinueSignUp}
            >
              Continue
            </Button>
          </form>
        </div>
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
        <Divider spacing={0} />
        <div className="flex items-center gap-[8px]">
          <p className="text-typeface_primary text-body-regular">
            Already have an account?
          </p>
          <a className="text-typeface_primary text-body-semibold">Sign in</a>
        </div>
      </div>
    );
  };

  const SignUpDetails = () => {
    return (
      <div className="flex flex-col gap-[24px]">
        <div className="flex flex-col gap-[16px]">
          <h3 className="py-[3px] text-h3">Tell us more about you</h3>
          <p className="text-typeface_primary text-body-regular">
            We're just missing a few details to finalize your account creation.
          </p>
        </div>
        <div className="">
          <form className="flex flex-col gap-[24px]">
            <div className="flex flex-col gap-[8px]">
              <p className="text-typeface_primary text-body-regular">Name:</p>
              <div className="flex gap-[12px]">
                <Textbox
                  name="firstName"
                  size="small"
                  width="204"
                  value=""
                  onChange={() => {}}
                  placeholder="First name*"
                />
                <Textbox
                  name="lastName"
                  size="small"
                  width="204"
                  value=""
                  onChange={() => {}}
                  placeholder="Last name*"
                />
              </div>
            </div>
            <div className="flex flex-col gap-[8px]">
              <p className="text-typeface_primary text-body-regular">
                Contact Details:
              </p>
              <div className="flex gap-[12px]">
                <Textbox
                  name="email"
                  size="small"
                  width="204"
                  value=""
                  onChange={() => {}}
                  placeholder="Email address*"
                />
                <Textbox
                  name="phoneNumber"
                  size="small"
                  width="204"
                  value=""
                  onChange={() => {}}
                  placeholder="Telephone number*"
                />
              </div>
            </div>
            <div className="flex flex-col gap-[8px]">
              <p className="text-typeface_primary text-body-regular">
                Enter a password:
              </p>
              <div className="flex gap-[12px]">
                <Textbox
                  name="password"
                  size="small"
                  width="204"
                  value=""
                  onChange={() => {}}
                  placeholder="New Password*"
                  password={true}
                />
                <Textbox
                  name="confirmPassword"
                  size="small"
                  width="204"
                  value=""
                  onChange={() => {}}
                  placeholder="Retype Password*"
                  password={true}
                />
              </div>
            </div>
            <Button
              className="button-primary self-end"
              onClick={handleContinueSignUp}
            >
              Continue
            </Button>
          </form>
        </div>
      </div>
    );
  };

  const handleContinueSignUp = () => {
    setSignUpStage(signUpStage + 1);
  };

  const renderContent = () => {
    if (signUpStage === 0) {
      return <LogInSignUpPage />;
    } else if (signUpStage === 1) {
      return <SignUpDetails />;
    }
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
