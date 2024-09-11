interface DividerProps {
  spacing: number;
}

export default function Divider({ spacing }: DividerProps) {
  return (
    <div
      style={{ marginTop: spacing, marginBottom: spacing }}
      className="border-t border-surface_bg_secondary"
    ></div>
  );
}
