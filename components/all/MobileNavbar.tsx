import Logo from "./Logo";
import { useResponsive } from "./ResponsiveContext";
import HamburgerButton from "./mobile/HamburgerButton";
import { useEffect, useRef, useState, useTransition } from "react";
import MobileNavMenu from "./mobile/MobileNavMenu";
import { usePopUp } from "./popups/PopUpContext";
import { useRouter } from "next/navigation";
import { useUserRole } from "./data-retrieval/UserRoleContext";
import { signOutAction } from "@/app/actions";
import { usePathname } from "next/navigation";
import { getGT } from "gt-next";


export default function MobileNavbar() {
    const { isMobile, isTablet, isDesktop } = useResponsive();
    const [isMobileNavMenuShown, setIsMobileNavMenuShown] = useState(false);
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

    const displayMobileNavMenu = () => {
        setIsMobileNavMenuShown(true);
    };

    const closeMobileNavMenu = () => {
        setIsMobileNavMenuShown(false);
    };

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
}
