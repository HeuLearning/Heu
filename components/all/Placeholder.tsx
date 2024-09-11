interface PlaceholderProps {
  width: number;
  height: number;
}

export default function Placeholder({ width, height }: PlaceholderProps) {
  return (
    <div
      className="rounded-[2px] bg-surface_bg_secondary"
      style={{ width: width, height: height }}
    ></div>
  );
}
