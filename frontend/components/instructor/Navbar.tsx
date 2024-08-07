import Logo from "./Logo";
import LanguageSelector from "./LanguageSelector";
import DropDownSelector from "./DropDownSelector";
import ProfilePic from "./ProfilePic";
import { useResponsive } from "./ResponsiveContext";
import HamburgerIcon from "./mobile/HamburgerIcon";
import { useState } from "react";
import MobileNavMenu from "./mobile/MobileNavMenu";
import NavButton from "./NavButton";

export default function Navbar() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [selectedButton, setSelectedButton] = useState("Dashboard");
  const [isMobileNavMenuShown, setIsMobileNavMenuShown] = useState(false);

  const displayMobileNavMenu = () => {
    setIsMobileNavMenuShown(true);
  };

  const closeMenu = () => {
    setIsMobileNavMenuShown(false);
  };

  const handleButtonClick = (buttonText) => {
    setSelectedButton(buttonText);
  };

  if (isMobile) {
    return (
      <div className="relative">
        {isMobileNavMenuShown ? (
          <div className="absolute inset-0 z-10">
            <MobileNavMenu closeMenu={closeMenu} />
          </div>
        ) : (
          <div>
            <div className="flex h-[64px] items-center justify-center bg-[#F5F5F5]">
              <Logo />
              <div className="absolute left-[16px]">
                <HamburgerIcon onClick={displayMobileNavMenu} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div className="flex items-center justify-between gap-[32px] bg-[#F5F5F5] px-[32px] py-[16px]">
        <div className="flex items-center gap-[32px]">
          <Logo />
          <div className="flex items-center gap-[12px]">
            <NavButton
              buttonText="Dashboard"
              selected={selectedButton === "Dashboard"}
              onClick={() => handleButtonClick("Dashboard")}
            />
            <NavButton
              buttonText="Training"
              selected={selectedButton === "Training"}
              onClick={() => handleButtonClick("Training")}
            />
          </div>
        </div>
        <div className="flex items-center gap-[12px]">
          <LanguageSelector
            className="drop-shadow-25"
            selected="EN"
            allOptions={[
              ["English", "EN"],
              ["Spanish", "ES"],
              ["Portuguese", "PT"],
            ]}
          />
          {/* <DropDownSelector
            selected="blah1"
            allOptions={["blah1", "blah2", "blah3"]}
          /> */}
          <ProfilePic />
        </div>
      </div>
    );
  }
}
