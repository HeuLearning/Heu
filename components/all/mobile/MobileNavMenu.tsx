import MobileDetailView from "./MobileDetailView";
import XButton from "../buttons/XButton";
import BackButton from "../buttons/BackButton";
import { useState } from "react";
import NavButton from "../buttons/NavButton";

interface MobileNavMenuProps {
  closeMenu: () => void;
}

export default function MobileNavMenu({ closeMenu }: MobileNavMenuProps) {
  const [selectedNavButton, setSelectedNavButton] = useState("Dashboard");
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const navButtons = ["Dashboard", "Language", "Profile"];
  const languages = ["English", "Spanish", "French"];

  const handleNavButtonClick = (buttonText: string) => {
    setSelectedNavButton(buttonText);
  };

  const handleLanguageButtonClick = (language: any) => {
    setSelectedLanguage(language);
  };

  const goBack = () => {
    setSelectedNavButton("Dashboard");
  };

  return (
    <MobileDetailView
      backgroundColor="bg-surface_bg_tertiary"
      className="px-[16px] pt-[16px]"
      headerContent={
        selectedNavButton === "Language" ? (
          <div className="flex h-[44px] w-full items-center justify-center">
            <h3 className="text-typeface_primary text-body-medium">Language</h3>
            <BackButton
              variation="button-secondary"
              onClick={goBack}
              className="absolute left-0"
            />
          </div>
        ) : (
          <div className="flex h-[44px] w-full items-center justify-center">
            <h3 className="text-typeface_primary text-body-medium">Menu</h3>
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
