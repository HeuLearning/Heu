interface ClassItemProps {
  phaseTitle: string;
  time: string;
}

export default function ClassItem({ phaseTitle, time }: ClassItemProps) {
  return (
    <div className="flex justify-between">
      <p className="text-typeface_primary text-body-medium">{phaseTitle}</p>
      <p className="text-typeface_secondary text-body-regular">{time}</p>
    </div>
  );
}
