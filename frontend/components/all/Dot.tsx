export default function Dot({ color = "", status = "" }) {
  let fillColor = color;
  if (status) {
    if (status === "Confirmed" || status === "Online") {
      fillColor = "var(--status_fg_positive)";
    } else if (status === "Pending" || status === "Waitlisted") {
      fillColor = "var(--typeface_primary)";
    } else if (status === "Canceled" || status === "Attended") {
      fillColor = "var(--typeface_tertiary)";
    }
  }
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="2" fill={fillColor} />
    </svg>
  );
}
