import ProfilePic from "./ProfilePic";

export default function LearnerItem({ name, status }) {
  let fillColor;
  let textColor;
  if (status === "In class") {
    fillColor = "var(--status_fg_positive)";
    textColor = "text-status_fg_positive";
  }
  return (
    <div className="flex justify-between">
      <div className="flex items-center gap-[4px]">
        <ProfilePic size={32} />
        <p className="text-typeface_primary text-body-medium">{name}</p>
      </div>
      <div className="flex items-center gap-[5px]">
        <svg
          width="6"
          height="6"
          viewBox="0 0 6 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="3" cy="3" r="3" fill={fillColor} />
        </svg>
        <p className={`text-body-semibold ${textColor}`}>{status}</p>
      </div>
    </div>
  );
}
