import Dot from "../Dot";
import ProfilePic from "../ProfilePic";

interface LearnerItemProps {
  name: string;
  status: string;
}

export default function LearnerItem({ name, status }: LearnerItemProps) {
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
      <div className="flex items-center">
        <Dot color={fillColor} />
        <p className={`text-body-semibold ${textColor}`}>{status}</p>
      </div>
    </div>
  );
}
