import { useResponsive } from "../ResponsiveContext";

interface IconButtonProps {
  disabled?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

export default function IconButton({
  children,
  disabled = false,
  className = "",
  onClick = () => {},
}: IconButtonProps) {
  return (
    <button
      className={`${className} icon-button relative h-[24px] w-[24px]`}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="center-atop-svg">{children}</div>
    </button>
  );
}
