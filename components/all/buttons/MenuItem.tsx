import Checkbox from "../../exercises/Checkbox";
import { useResponsive } from "../ResponsiveContext";

interface MenuItemProps {
  checkbox?: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

export default function MenuItem({ checkbox = false, onClick, children }: MenuItemProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  return (
    <button
      className={`${
        isMobile && "h-[44px]"
      } menu-item flex w-full items-center justify-center gap-[8px] whitespace-nowrap rounded-[6px] px-[12px] py-[11px]`}
      onClick={onClick}
    >
      {checkbox && <Checkbox />}
      <div>{children}</div>
    </button>
  );
}
