import Logo from "./Logo";
import LanguageSelector from "./LanguageSelector";
import DropDownSelector from "./DropDownSelector";
import ProfilePic from "./ProfilePic";
import { useResponsive } from "./ResponsiveContext";
import HamburgerIcon from "./mobile/HamburgerIcon";
import { useState } from "react";
import MobileNavMenu from "./mobile/MobileNavMenu";
import NavButton from "./NavButton";
import NotificationButton from "./NotificationButton";
import { usePopUp } from "./PopUpContext";
import SidePopUp from "./SidePopUp";
import XButton from "./XButton";
import ToggleButton from "./ToggleButton";
import Button from "./Button";
import Divider from "./Divider";
import { useRouter } from "next/router";

export default function Navbar() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [selectedButton, setSelectedButton] = useState("Dashboard");
  const [isMobileNavMenuShown, setIsMobileNavMenuShown] = useState(false);
  const [activeNotifTab, setActiveNotifTab] = useState("New");
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);

  const router = useRouter();

  const oldNotifs = [
    ["Request to swap not approved for June 20", "View more"],
    ["blah blah blah", "RSVP"],
  ];

  const newNotifs = [
    ["Last chance to confirm attendance for class on June 20, 6PM", "RSVP"],
    ["New slots added in July", "View details"],
    ["blah blah blah", "RSVP"],
    ["blah blah blah", "RSVP"],
    ["blah blah blah", "RSVP"],
    ["blah blah blah", "RSVP"],
    ["blah blah blah", "RSVP"],
    ["blah blah blah", "RSVP"],
    ["blah blah blah", "RSVP"],
    ["blah blah blah", "RSVP"],
    ["blah blah blah", "RSVP"],
    ["blah blah blah", "RSVP"],
    ["blah blah blah", "RSVP"],
    ["blah blah blah", "RSVP"],
    ["blah blah blah", "RSVP"],
  ];

  const displayMobileNavMenu = () => {
    setIsMobileNavMenuShown(true);
  };

  const closeMobileNavMenu = () => {
    setIsMobileNavMenuShown(false);
  };

  const handleButtonClick = (buttonText) => {
    setSelectedButton(buttonText);
  };

  const { showPopUp, updatePopUp, hidePopUp } = usePopUp();

  const NotifContent = ({ activeTab, onToggle, onClose }) => {
    const notifs = activeTab === "New" ? newNotifs : oldNotifs;
    // Get the container element
    let dashboardContainer;
    // assumes that only two URLs are going to be the instructor dashboard and the class mode
    if (router.pathname === "/instructor/instructor-test")
      dashboardContainer = document.getElementById("dashboard-container");
    else dashboardContainer = document.getElementById("class-mode-container");

    // Calculate the height
    const containerHeight = dashboardContainer.offsetHeight;

    return (
      <SidePopUp
        headerContent={
          <div className="flex flex-col gap-[24px]">
            <div className="flex items-center justify-between font-medium text-typeface_primary text-h3">
              Activity
              <XButton onClick={onClose} />
            </div>
            <div className="-mx-[8px]">
              <ToggleButton
                buttonOptions={["New", "Archive"]}
                selected={activeTab}
                onToggle={onToggle}
              />
            </div>
          </div>
        }
        height={containerHeight}
        className="absolute right-0 top-0 flex flex-col"
      >
        <div className="flex flex-col">
          {notifs.length > 0 ? (
            notifs.map((notif, index) => (
              <div>
                {index > 0 && (
                  <div className="px-[4px]">
                    <Divider spacing={8} />
                  </div>
                )}
                <div className="flex items-center justify-between gap-[48px] px-[4px] py-[7px] text-typeface_primary text-body-medium">
                  {notif[0]}
                  <Button className="button-primary whitespace-nowrap">
                    {notif[1]}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-typeface_secondary text-body-medium">
              No activity to show here, yet.
            </div>
          )}
        </div>
      </SidePopUp>
    );
  };

  const onToggle = (selected) => {
    setActiveNotifTab(selected);
    updatePopUp(
      "notifs-popup",
      <NotifContent
        activeTab={selected}
        onToggle={onToggle}
        onClose={handleCloseNotifs}
      />
    );
  };

  const toggleNotifs = (isNotifsOpen) => {
    setIsNotifsOpen(!isNotifsOpen);
    if (isNotifsOpen) handleCloseNotifs();
    else {
      showPopUp({
        id: "notifs-popup",
        content: (
          <NotifContent
            activeTab={activeNotifTab}
            onToggle={onToggle}
            onClose={handleCloseNotifs}
          />
        ),
        container:
          router.pathname === "/instructor/instructor-test"
            ? "#dashboard-container"
            : "#class-mode-container", // Ensure this ID exists in your DOM
        style: {
          overlay: "overlay-low rounded-[20px]",
        },
        height: "auto",
      });
    }
  };

  const handleCloseNotifs = () => {
    hidePopUp("notifs-popup");
    setActiveNotifTab("New");
    setIsNotifsOpen(false);
  };

  if (isMobile) {
    return (
      <div className="relative">
        {isMobileNavMenuShown ? (
          <div className="absolute inset-0 z-10">
            <MobileNavMenu closeMenu={closeMobileNavMenu} />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center bg-[#F5F5F5] py-[10px]">
              <Logo />
              <div className="absolute left-[16px] top-[10px]">
                <HamburgerIcon onClick={displayMobileNavMenu} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div className="flex items-center justify-between gap-[32px] bg-[#F5F5F5] px-[32px] py-[12px]">
        <div className="flex items-center gap-[32px]">
          <Logo />
          <div className="flex items-center gap-[16px]">
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
        <div className="flex items-center gap-[16px]">
          <LanguageSelector
            className="shadow-25"
            selected="EN"
            allOptions={[
              ["English", "EN"],
              ["Spanish", "ES"],
              ["Portuguese", "PT"],
            ]}
          />
          <NotificationButton
            onClick={() => toggleNotifs(isNotifsOpen)}
            isOpen={isNotifsOpen}
          />
          <ProfilePic />
        </div>
      </div>
    );
  }
}
