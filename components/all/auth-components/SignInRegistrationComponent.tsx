import Divider from "../Divider";
import Textbox from "../../exercises/Textbox";
import Button from "../buttons/Button";
import { useTransition, useEffect, useState } from "react";
import { signInAction } from "@/app/actions";
import { useSearchParams } from "next/navigation";
import { getGT } from "gt-next";
import dictionary from "@/dictionary";
import { useResponsive } from "../ResponsiveContext";

export default function SignInRegistrationComponent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>("");

  const t = getGT();

  const [isPending, startTransition] = useTransition();

  const { isMobile, isTablet, isDesktop } = useResponsive();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    const errorMessage = searchParams.get("error");
    if (errorMessage) {
      // Decode the error message
      setError(decodeURIComponent(errorMessage));
    }
  }, [searchParams]);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      signInAction(formData);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      handleSubmit(e); // Trigger the submit function when Enter key is pressed
    }
  };

  const renderContent = () => {
    return (
      <div className="flex flex-col gap-[24px]">
        <h3 className="py-[3px] text-h3">
          {t("sign_in_sign_up_content.sign_in_heu")}
        </h3>
        <form
          className="flex flex-col gap-[24px]"
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
        >
          <div className="flex flex-col gap-[12px]">
            <Textbox
              name="email"
              size="small"
              width={isMobile ? "100%" : "324"}
              value={email}
              placeholder={t("sign_in_sign_up_content.email")}
              required={true}
              onChange={(value) => setEmail(value)}
            />
            <Textbox
              name="password"
              size="small"
              width={isMobile ? "100%" : "324"}
              value={password}
              placeholder={t("sign_in_sign_up_content.password")}
              onChange={(value) => setPassword(value)}
              required={true}
              password={true}
              errorMessage={error}
            />
          </div>
          <div className="self-start">
            <Button className="button-primary" disabled={isPending}>
              {t("button_content.sign_in")}
            </Button>
          </div>
          {/* <div className="relative">
            <Divider spacing={8} />
            <span className="absolute left-[28px] top-[-4px] bg-white px-[6px] text-typeface_secondary text-body-regular">
              {t("sign_in_sign_up_content.or")}
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
          </Button> */}
        </form>
        <a
          href="/forgot-password"
          className="text-typeface_primary text-body-semibold"
        >
          {t("sign_in_sign_up_content.forgot_password")}
        </a>
        <Divider spacing={0} />
        <div
          className={`${isMobile ? "flex flex-col" : "flex items-center"} gap-[8px]`}
        >
          <p className="text-typeface_primary text-body-regular">
            {t("sign_in_sign_up_content.no_account")}
          </p>
          <a
            href="/sign-up"
            className="text-typeface_primary text-body-semibold"
          >
            {t("sign_in_sign_up_content.sign_up")}
          </a>
        </div>
      </div>
    );
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div
        className={`inset-0 z-[50] flex ${isMobile ? "fixed h-screen w-screen" : "w-[372px]"} flex-col rounded-[20px] bg-white p-[24px] shadow-200 outline-surface_border_tertiary`}
      >
        {renderContent()}
      </div>
    </div>
  );
}
