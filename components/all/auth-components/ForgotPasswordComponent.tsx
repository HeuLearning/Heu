import Divider from "../Divider";
import Textbox from "../../exercises/Textbox";
import Button from "../buttons/Button";
import { useTransition, useEffect, useState } from "react";
import { forgotPasswordAction } from "@/app/actions";
import { useSearchParams } from "next/navigation";
import { getGT } from "gt-next";
import dictionary from "@/dictionary";
import { useResponsive } from "../ResponsiveContext";

{
  /* <form className="flex-1 flex flex-col w-full gap-2 text-foreground [&>input]:mb-6 min-w-64 max-w-64 mx-auto">
        <div>
          <h1 className="text-2xl font-medium">Reset Password</h1>
          <p className="text-sm text-secondary-foreground">
            Already have an account?{" "}
            <Link className="text-primary underline" href="/sign-in">
              Sign in
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <SubmitButton formAction={forgotPasswordAction}>
            Reset Password
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form> */
}

export default function ForgotPasswordComponent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>("");

  const t = getGT();

  const [isPending, startTransition] = useTransition();

  const { isMobile, isTablet, isDesktop } = useResponsive();

  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const errorMessage = searchParams.get("error");
    if (errorMessage) {
      // Decode the error message
      setError(decodeURIComponent(errorMessage));
    }
  }, [searchParams]);

  useEffect(() => {
    console.log(email);
  }, [email]);

  const renderContent = () => {
    return (
      <div className="flex flex-col gap-[24px]">
        <h3 className="py-[3px] text-h3">
          {t("button_content.reset_password")}
        </h3>
        <p className="text-typeface_primary text-body-regular">
          {t("sign_in_sign_up_content.forgot_password_description")}
        </p>
        <form
          className="flex flex-col gap-[16px]"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            startTransition(() => {
              forgotPasswordAction(formData);
            });
          }}
        >
          <div className="flex flex-col gap-[12px]">
            <Textbox
              name="email"
              size="small"
              width={isMobile ? "100%" : "324"}
              value={email}
              placeholder={t("sign_in_sign_up_content.email")}
              required={true}
              onChange={(value) => {
                setEmail(value);
              }}
            />
          </div>
          <div className="self-start">
            <Button className="button-primary" disabled={isPending}>
              {t("button_content.reset_password")}
            </Button>
          </div>
        </form>
      </div>
    );
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div
        className={`inset-0 z-[50] flex ${isMobile ? "h-screen w-screen" : "w-[372px]"} flex-col rounded-[20px] bg-white p-[24px] shadow-200 outline-surface_border_tertiary`}
      >
        {renderContent()}
      </div>
    </div>
  );
}
