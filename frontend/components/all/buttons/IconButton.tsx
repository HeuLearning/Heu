import { useResponsive } from "../ResponsiveContext";

export default function IconButton({
  children,
  disabled = false,
  className = "",
  onClick = null,
}) {
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
