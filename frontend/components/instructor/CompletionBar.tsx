export default function CompletionBar({ percentage }) {
  let rounded = "";
  if (percentage < 1) rounded = "rounded-tl-full rounded-bl-full";
  else rounded = "rounded-full";

  return percentage >= 0 && percentage <= 1 ? (
    <div className="relative h-[4px] w-full rounded-full bg-surface_bg_secondary">
      <div
        className={`absolute h-full ${rounded} bg-surface_bg_darkest transition-all duration-300`}
        style={{ width: `${percentage * 100}%` }}
      />
    </div>
  ) : null;
}
