import MobileDetailView from "./MobileDetailView";
import XButton from "../buttons/XButton";
import BackButton from "../buttons/BackButton";
import { useState } from "react";
import NavButton from "../buttons/NavButton";
import dictionary from "@/dictionary";
import { getGT } from "gt-next";
import { useUserRole } from "../data-retrieval/UserRoleContext";
import ProfilePic from "../ProfilePic";
import Dot from "../Dot";
import Button from "../buttons/Button";
import { signOutAction } from "@/app/actions";

interface MobileNavMenuProps {
  closeMenu: () => void;
}

export default function MobileNavMenu({ closeMenu }: MobileNavMenuProps) {
  const t = getGT();

  const [selectedNavButton, setSelectedNavButton] = useState(
    t("button_content.dashboard"),
  );
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const { userRole, firstName, lastName, email } = useUserRole();

  const navButtons = [
    t("button_content.dashboard"),
    t("button_content.profile"),
  ];
  const languages = ["English", "Spanish", "French"];

  const handleNavButtonClick = (buttonText: string) => {
    setSelectedNavButton(buttonText);
  };

  const handleLanguageButtonClick = (language: any) => {
    setSelectedLanguage(language);
  };

  const goBack = () => {
    setSelectedNavButton(t("button_content.dashboard"));
  };

  return (
    <MobileDetailView
      backgroundColor="bg-surface_bg_tertiary"
      className="px-[16px] pt-[16px]"
      headerContent={
        selectedNavButton === t("button_content.profile") ? (
          <div className="flex h-[44px] w-full items-center justify-center">
            <h3 className="text-typeface_primary text-body-medium">
              {t("button_content.profile")}
            </h3>
            <BackButton
              variation="button-secondary"
              onClick={goBack}
              className="absolute left-0"
            />
          </div>
        ) : (
          <div className="flex h-[44px] w-full items-center justify-center">
            <h3 className="text-typeface_primary text-body-medium">
              {t("session_detail_content.menu")}
            </h3>
            <XButton
              variation="button-secondary"
              onClick={closeMenu}
              className="absolute right-0"
            />
          </div>
        )
      }
    >
      {selectedNavButton === "Language" ? (
        <div className="space-y-[24px]">
          <div className="flex flex-col gap-[24px]">
            {languages.map((language) => (
              <NavButton
                key={language}
                buttonText={language}
                selected={selectedLanguage === language}
                onClick={() => handleLanguageButtonClick(language)}
              />
            ))}
          </div>
        </div>
      ) : selectedNavButton === t("button_content.profile") ? (
        <div className="flex flex-col justify-center gap-[16px] pb-[16px]">
          <div className="flex items-center gap-[4px]">
            <ProfilePic size={48} />
            <div>
              <div className="flex items-center">
                <p className="text-typeface_primary text-body-semibold">
                  {firstName + " " + lastName}
                </p>
                <Dot color="var(--typeface_primary)" />
                <p className="text-typeface_primary text-body-medium">
                  {userRole === "st"
                    ? t("roles.learner")
                    : userRole === "in"
                      ? t("roles.instructor")
                      : t("roles.admin")}
                </p>
              </div>
              <p className="text-typeface_primary text-body-medium">{email}</p>
            </div>
          </div>
          <Button className="button-primary" onClick={() => signOutAction()}>
            {t("button_content.log_out")}
          </Button>
        </div>
      ) : (
        <div className="space-y-[24px]">
          <div className="flex flex-col gap-[24px]">
            {navButtons.map((buttonText) => (
              <NavButton
                key={buttonText}
                buttonText={buttonText}
                selected={selectedNavButton === buttonText}
                onClick={() => handleNavButtonClick(buttonText)}
              />
            ))}
          </div>
        </div>
      )}
    </MobileDetailView>
  );
}
