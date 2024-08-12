import Dot from "./Dot";

export default function SessionTab({
  status,
  children,
  selected,
  onClick,
  className,
}) {
  let fillColor;
  if (status === "Confirmed") fillColor = "var(--status_fg_positive)";
  else if (status === "Online") fillColor = "var(--status_fg_positive)";
  else if (status === "Pending") fillColor = "var(--typeface_primary)";
  else if (status === "Canceled") fillColor = "var(--typeface_tertiary)";
  return (
    <div
      className={`${
        selected
          ? "bg-surface_bg_highlight"
          : "border-b-[1px] border-surface_border_tertiary bg-surface_bg_tertiary"
      } ${className} z-10 -mb-[1px] cursor-pointer rounded-t-[10px] border-l-[1px] border-r-[1px] border-t-[1px] border-l-surface_border_tertiary border-r-surface_border_tertiary border-t-surface_border_tertiary py-[11px] pl-[8px] pr-[12px]`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <Dot color={fillColor} />
        <div
          className={`text-typeface_primary ${
            selected
              ? "text-body-semibold-cap-height"
              : "text-body-medium-cap-height"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
