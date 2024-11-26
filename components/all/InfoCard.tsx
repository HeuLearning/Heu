import { useResponsive } from "./ResponsiveContext";

interface InfoCardProps {
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
}

export default function InfoCard({ className = "", onClick = () => {}, children }: InfoCardProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  return (
    <div
      className={`flex flex-col rounded-[10px] bg-white ${
        isMobile ? "px-[16px] py-[24px]" : "p-[24px]"
      } outline-surface_border_tertiary ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
