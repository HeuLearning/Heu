import { useResponsive } from "./ResponsiveContext";

export default function IconButton({
  children,
  className = "",
  onClick = null,
}) {
  return (
    <button
      className={`${className} icon-button relative h-[24px] w-[24px]`}
      onClick={onClick}
    >
      <div className="center-atop-svg">{children}</div>
    </button>
  );
}
