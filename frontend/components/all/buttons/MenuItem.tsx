import Checkbox from "components/exercises/Checkbox";
import { useResponsive } from "../ResponsiveContext";

export default function MenuItem({ checkbox = false, onClick, children }) {
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
