interface CompletionBarProps {
  percentage: number;
  status?: string;
}

export default function CompletionBar({ percentage, status = "" }: CompletionBarProps) {
  return percentage >= 0 && percentage <= 1 ? (
    <div className="relative h-[4px] w-full rounded-full bg-surface_bg_secondary">
      <div
        className={`absolute h-full rounded-full transition-all duration-300 ${
          status === "done" ? "bg-surface_bg_dark" : "bg-surface_bg_darkest"
        }`}
        style={{ width: `${percentage * 100}%` }}
      />
    </div>
  ) : null;
}
