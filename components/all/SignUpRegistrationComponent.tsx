import RadioButton from "../exercises/RadioButton";
import Divider from "./Divider";
import Textbox from "../exercises/Textbox";
import Button from "./buttons/Button";
import { useCallback, useEffect, useRef, useState } from "react";

interface SignUpRegistrationComponent {
  className?: string;
}

// <>
//     <form className="flex flex-col min-w-64 max-w-64 mx-auto">
//       <h1 className="text-2xl font-medium">Sign up</h1>
//       <p className="text-sm text text-foreground">
//         Already have an account?{" "}
//         <Link className="text-primary font-medium underline" href="/sign-in">
//           Sign in
//         </Link>
//       </p>
//       <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
//         <Label htmlFor="email">Email</Label>
//         <Input name="email" placeholder="you@example.com" required />
//         <Label htmlFor="password">Password</Label>
//         <Input
//           type="password"
//           name="password"
//           placeholder="Your password"
//           minLength={6}
//           required
//         />
//         <SubmitButton formAction={signUpAction} pendingText="Signing up...">
//           Sign up
//         </SubmitButton>
//         <FormMessage message={searchParams} />
//       </div>
//     </form>
//     <SmtpMessage />
//   </>

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default function SignUpRegistrationComponent({
  className = "",
}: SignUpRegistrationComponent) {
  const [signUpStage, setSignUpStage] = useState(0);
  const [role, setRole] = useState("");

  const [isFormValid, setIsFormValid] = useState(false);

  // const [formData, setFormData] = useState({
  //   firstName: "",
  //   lastName: "",
  //   phoneNumber: "",
  //   email: "",
  // });

  const formDataRef = useRef({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    role: "",
    hasPassword: 1,
  });

  let localEmail = formDataRef.current.email;
  let localFirstName = formDataRef.current.firstName;
  let localLastName = formDataRef.current.lastName;
  let localPhoneNumber = formDataRef.current.phoneNumber;
  let localHasPassword = formDataRef.current.hasPassword;

  console.log(localEmail);

  const emailRef = useRef<HTMLDivElement>(null);
  const firstNameRef = useRef<HTMLDivElement>(null);
  const lastNameRef = useRef<HTMLDivElement>(null);
  const phoneNumberRef = useRef<HTMLDivElement>(null);
  const learnerRef = useRef<HTMLDivElement>(null);
  const instructorRef = useRef<HTMLDivElement>(null);

  const backgroundRef = useRef<HTMLDivElement>(null);

  const checkInitialSignUpPage = () => {
    if (role === "") return false;
    return true;
  };

  // const checkFormDetails = () => {
  //   console.log(localEmail);
  //   if (
  //     role === "" ||
  //     localEmail === "" ||
  //     localFirstName === "" ||
  //     localLastName === "" ||
  //     localPhoneNumber === ""
  //   ) {
  //     return false;
  //   } else return true;
  // };

  // useEffect(() => {
  //   const handleClickOutside = (event: PointerEvent) => {
  //     console.log("IAOWEJAWEIOFJOAJIWEOJF");
  //     console.log(localEmail);

  //     if (
  //       backgroundRef.current &&
  //       backgroundRef.current.contains(event.target as Node)
  //     ) {
  //       const target = event.target as HTMLElement;

  //       // Check if the clicked element is an action item
  //       const isActionItem =
  //         target.tagName === "BUTTON" ||
  //         target.tagName === "INPUT" ||
  //         target.tagName === "LABEL" ||
  //         target.closest("button") ||
  //         target.closest("input") ||
  //         target.closest("label");

  //       if (!isActionItem) {
  //         console.log("clicked on background");
  //         console.log(localEmail);
  //         updateFormData();
  //       }
  //     }
  //   };

  //   document.addEventListener("pointerdown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("pointerdown", handleClickOutside);
  //   };
  // }, []);

  // const updateFormData = () => {
  //   console.log("updating form data");
  //   console.log(localEmail);
  //   const updatedFormData = {
  //     email: localEmail,
  //     firstName: localFirstName,
  //     lastName: localLastName,
  //     phoneNumber: localPhoneNumber,
  //   };
  //   setFormData({ ...formData, ...updatedFormData });
  // };

  const updateFormData = () => {
    formDataRef.current = {
      email: localEmail,
      firstName: localFirstName,
      lastName: localLastName,
      phoneNumber: localPhoneNumber,
      role,
      hasPassword: localHasPassword,
    };
    debouncedCheckFormValidity();
  };

  const debouncedCheckFormValidity = useCallback(
    debounce(() => {
      const { email, firstName, lastName, phoneNumber, role, hasPassword } =
        formDataRef.current;
      const newValidity = Boolean(
        email &&
          firstName &&
          lastName &&
          phoneNumber &&
          role &&
          hasPassword == 0,
      );
      if (newValidity !== isFormValid) {
        console.log(formDataRef.current);
        setIsFormValid(newValidity);
      }
    }, 300),
    [isFormValid],
  );

  const InitialSignUpPage = () => {
    return (
      <div className="flex flex-col gap-[24px]">
        <h3 className="py-[3px] text-h3">Create a Heu Learning account</h3>
        <div className="flex flex-col gap-[24px]">
          <div className="space-y-[16px]">
            <RadioButton
              label="I want to learn English"
              name="accountType"
              value="st"
              checked={role === "st"}
              onChange={(e: any) => {
                setRole(e.target.value);
                formDataRef.current.role = e.target.value;
                updateFormData();
              }}
              ref={learnerRef}
              className="gap-[10px]"
            />
            <RadioButton
              label="I want to teach English"
              name="accountType"
              value="in"
              checked={role === "in"}
              onChange={(e: any) => {
                setRole(e.target.value);
                formDataRef.current.role = e.target.value;
                updateFormData();
              }}
              ref={instructorRef}
              className="gap-[10px]"
            />
          </div>
          <div className="pb-[4px] pt-[8px]">
            <Divider spacing={0} />
          </div>
          {/* <Textbox
              name="email"
              size="small"
              width="324"
              value={localEmail}
              onChange={(value: string) => {
                localEmail = value;
                console.log(localEmail);
              }}
              ref={emailRef}
              placeholder="Email address"
              required={true}
            /> */}
          <div className="self-start">
            <Button
              className={"button-primary"}
              disabled={!checkInitialSignUpPage()}
              onClick={() => handleContinueSignUp()}
            >
              Continue with Email
            </Button>
          </div>
        </div>
        <div className="relative">
          <Divider spacing={4} />
          <span className="absolute left-[28px] top-[-2px] bg-white px-[6px] text-typeface_secondary text-body-regular-cap-height">
            or
          </span>
        </div>
        <div className="self-start">
          <Button
            className="button-tertiary"
            disabled={!checkInitialSignUpPage()}
          >
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
        </div>
        <div className="pb-[8px] pt-[4px]">
          <Divider spacing={0} />
        </div>
        <div className="flex items-center gap-[8px]">
          <p className="text-typeface_primary text-body-regular">
            Already have an account?
          </p>
          <a
            className="text-typeface_primary text-body-semibold"
            href="/sign-in"
          >
            Sign in
          </a>
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
        <div className="flex flex-col gap-[24px]">
          <div className="flex flex-col gap-[8px]">
            <p className="text-typeface_primary text-body-regular">Name:</p>
            <div className="flex gap-[12px]">
              <Textbox
                name="firstName"
                size="small"
                width="204"
                value={localFirstName}
                onChange={(value: any) => {
                  localFirstName = value;
                  updateFormData();
                }}
                ref={firstNameRef}
                placeholder="First name*"
                required={true}
              />
              <Textbox
                name="lastName"
                size="small"
                width="204"
                value={localLastName}
                onChange={(value: any) => {
                  localLastName = value;
                  updateFormData();
                }}
                ref={lastNameRef}
                placeholder="Last name*"
                required={true}
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
                value={localEmail}
                onChange={(value: any) => {
                  localEmail = value;
                  updateFormData();
                }}
                ref={emailRef}
                placeholder="Email address*"
                required={true}
              />
              <Textbox
                name="phoneNumber"
                size="small"
                width="204"
                value={localPhoneNumber}
                ref={phoneNumberRef}
                onChange={(value: any) => {
                  localPhoneNumber = value;
                  updateFormData();
                }}
                placeholder="Telephone number*"
                required={true}
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
                onChange={(value: string) => {
                  localHasPassword = 5;
                  updateFormData();
                }}
                placeholder="New Password*"
                password={true}
                required={true}
              />
              <Textbox
                name="confirmPassword"
                size="small"
                width="204"
                value=""
                onChange={(value: string) => {
                  localHasPassword *= 0;
                  console.log(localHasPassword);
                  updateFormData();
                }}
                placeholder="Retype Password*"
                password={true}
                required={true}
              />
            </div>
          </div>
          <div className="space-x-[12px] self-end">
            <Button className="button-secondary" onClick={handleBack}>
              Back
            </Button>
            <Button
              className="button-primary"
              onClick={handleContinueSignUp}
              disabled={!isFormValid}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const PickLearningCenter = () => {
    return (
      <div className="flex flex-col gap-[24px]">
        <div className="flex flex-col gap-[16px]">
          <h3 className="py-[3px] text-h3">Pick your learning center</h3>
          <p className="text-typeface_primary text-body-regular">
            For Fall 2024, we are only offering sessions at _____.
          </p>
        </div>
        <div className="space-x-[12px] self-end">
          <Button className="button-secondary" onClick={handleBack}>
            Back
          </Button>
          <Button className="button-primary" onClick={handleContinueSignUp}>
            Finish Signing Up
          </Button>
        </div>
      </div>
    );
  };

  const handleContinueSignUp = () => {
    updateFormData();
    setSignUpStage(Math.min(signUpStage + 1, 2));
  };

  const handleBack = () => {
    updateFormData();
    setSignUpStage(Math.max(signUpStage - 1, 0));
  };

  const renderContent = () => {
    if (signUpStage === 0) {
      return <InitialSignUpPage />;
    } else if (signUpStage === 1) {
      return <SignUpDetails />;
    } else if (signUpStage === 2) {
      return <PickLearningCenter />;
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      ref={backgroundRef}
    >
      <div
        className={`inset-0 z-[50] ${className} flex ${
          signUpStage === 0 ? "w-[372px]" : ""
        } ${
          signUpStage >= 1 ? "w-[468px]" : ""
        } flex-col rounded-[20px] bg-white p-[24px] shadow-200 outline-surface_border_tertiary`}
      >
        {renderContent()}
      </div>
    </div>
  );
}
