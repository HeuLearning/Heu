import { useResponsive } from "./ResponsiveContext";

interface DateCardProps {
  month: string;
  day: string;
}

export default function DateCard({ month, day }: DateCardProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  return (
    <div
      className={`inline-flex ${
        isMobile
          ? "h-[64px] w-[64px] space-y-[1px] rounded-[14px] pt-[9px]"
          : "h-[56px] w-[56px] space-y-[4px] rounded-[10px] pb-[8px] pt-[12px]"
      } flex-col items-center justify-center bg-white px-[8px] align-middle shadow-200`}
    >
      <h1 className="font-semibold uppercase text-[#FE0909] text-[12px] leading-cap-height">
        {month}
      </h1>
      <h1 className="text-typeface_primary leading-[0.8] text-h1">{day}</h1>
    </div>
  );
}
