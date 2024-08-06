import MobileDetailView from "./MobileDetailView";
import XButton from "../XButton";
import BackButton from "../BackButton";
import { useState } from "react";
import NavButton from "../NavButton";

export default function MobileNavMenu({ closeMenu }) {
  const [selectedNavButton, setSelectedNavButton] = useState("Dashboard");
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const navButtons = ["Dashboard", "Training", "Language", "Profile"];
  const languages = ["English", "Spanish", "French"];

  const handleNavButtonClick = (buttonText) => {
    setSelectedNavButton(buttonText);
  };

  const handleLanguageButtonClick = (language) => {
    setSelectedLanguage(language);
  };

  const goBack = () => {
    setSelectedNavButton("Dashboard");
  };

  return (
    <MobileDetailView
      backgroundColor="bg-surface_bg_tertiary"
      className="px-[24px] pt-[24px]"
    >
      {selectedNavButton === "Language" ? (
        <div className="space-y-[24px]">
          <div className="flex items-center gap-[24px]">
            <BackButton onClick={goBack} />
            <h3 className="text-typeface_primary text-h3">Language</h3>
          </div>
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
          <div className="flex items-center justify-between">
            <h3 className="text-typeface_primary text-h3">Menu</h3>
            <XButton onClick={closeMenu} />
          </div>
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
