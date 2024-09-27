import Logo from "./Logo";
import LanguageSelector from "./buttons/LanguageSelector";
import ProfilePic from "./ProfilePic";
import { useResponsive } from "./ResponsiveContext";
import HamburgerButton from "./mobile/HamburgerButton";
import { useEffect, useRef, useState, useTransition } from "react";
import MobileNavMenu from "./mobile/MobileNavMenu";
import NavButton from "./buttons/NavButton";
import NotificationButton from "./buttons/NotificationButton";
import { usePopUp } from "./popups/PopUpContext";
import SidePopUp from "./popups/SidePopUp";
import XButton from "./buttons/XButton";
import ToggleButton from "./buttons/ToggleButton";
import Button from "./buttons/Button";
import Divider from "./Divider";
import { useRouter } from "next/navigation";
import { useUserRole } from "./data-retrieval/UserRoleContext";
import { signOutAction } from "@/app/actions";
import { usePathname } from "next/navigation";
import Dot from "./Dot";
import dictionary from "../../dictionary.js";
import { getGT } from "gt-next";

interface NavbarProps {
  activeTab: string;
}

export default function Navbar({ activeTab }: NavbarProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { userRole, firstName, lastName, email } = useUserRole();
  const [selectedButton, setSelectedButton] = useState(activeTab);
  const [isMobileNavMenuShown, setIsMobileNavMenuShown] = useState(false);
  const [activeNotifTab, setActiveNotifTab] = useState("New");
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [isSettingsShown, setIsSettingsShown] = useState(false);

  const [isPending, startTransition] = useTransition();

  const t = getGT();

  const pathname = usePathname();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const profilePicRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (
        dropdownRef.current &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target) &&
        !profilePicRef.current?.contains(event.target)
      ) {
        setIsSettingsShown(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

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

  const handleButtonClick = (buttonText: string) => {
    setSelectedButton(buttonText);
    if (buttonText === t("button_content.dashboard")) {
      router.push("dashboard");
    } else if (userRole === "in" && buttonText === "Training") {
      router.push("training");
    } else if (userRole === "st" && buttonText === "Diagnostic") {
      router.push("diagnostic");
    }
  };

  const { showPopUp, updatePopUp, hidePopUp } = usePopUp();

  const NotifContent = ({
    activeTab,
    onToggle,
    onClose,
  }: {
    activeTab: string;
    onToggle: (selected: string) => void;
    onClose: () => void;
  }) => {
    const notifs = activeTab === "New" ? newNotifs : oldNotifs;
    // Get the container element
    let dashboardContainer;
    // assumes that only two URLs are going to be the instructor dashboard and the class mode
    if (pathname?.includes("dashboard"))
      dashboardContainer = document.getElementById("dashboard-container");
    else dashboardContainer = document.getElementById("class-mode-container");

    // Calculate the height
    const containerHeight = dashboardContainer?.offsetHeight;

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

  const onToggle = (selected: string) => {
    setActiveNotifTab(selected);
    updatePopUp(
      "notifs-popup",
      <NotifContent
        activeTab={selected}
        onToggle={onToggle}
        onClose={handleCloseNotifs}
      />,
    );
  };

  const toggleNotifs = (isNotifsOpen: boolean) => {
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
        container: pathname?.includes("dashboard")
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

  const displaySettings = () => {
    setIsSettingsShown(true);
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
                <HamburgerButton onClick={displayMobileNavMenu} />
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
              buttonText={t("button_content.dashboard")}
              selected={selectedButton === t("button_content.dashboard")}
              onClick={() => handleButtonClick(t("button_content.dashboard"))}
            />
            {/* {userRole === "in" ? (
              <NavButton
                buttonText="Training"
                selected={selectedButton === "Training"}
                onClick={() => handleButtonClick("Training")}
              />
            ) : (
              <NavButton
                buttonText="Diagnostic"
                selected={selectedButton === "Diagnostic"}
              />
            )} */}
          </div>
        </div>
        <div className="flex items-center gap-[16px]">
          {/* <LanguageSelector
            className="shadow-25"
            selected="EN"
            allOptions={[
              ["English", "EN"],
              ["Spanish", "ES"],
              ["Portuguese", "PT"],
            ]}
          /> */}
          <NotificationButton
            onClick={() => toggleNotifs(isNotifsOpen)}
            isOpen={isNotifsOpen}
          />
          <div ref={profilePicRef}>
            <ProfilePic onClick={() => setIsSettingsShown(!isSettingsShown)} />
          </div>
          {isSettingsShown && (
            <div
              ref={dropdownRef}
              className="absolute right-[16px] top-[52px] z-50 flex min-w-[300px] flex-col gap-[8px] rounded-[20px] bg-white p-[16px] shadow-200 outline-surface_border_tertiary"
            >
              <div className="flex flex-col justify-center gap-[12px] pb-[16px]">
                <div className="flex items-center gap-[4px]">
                  <ProfilePic size={48} />
                  <div>
                    <div className="flex">
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
                    <p className="text-typeface_primary text-body-medium">
                      {email}
                    </p>
                  </div>
                </div>
              </div>
              <Button className="button-secondary">
                {t("button_content.settings")}
              </Button>
              <div className="px-[4px]">
                <Divider spacing={4} />
              </div>
              <Button
                className="button-primary justify-end"
                onClick={() => startTransition(() => signOutAction())}
                disabled={isPending}
              >
                {t("button_content.log_out")}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
}
