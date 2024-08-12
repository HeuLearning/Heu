export default function ClassItem({ phaseTitle, time }) {
  return (
    <div className="flex justify-between">
      <p className="text-typeface_primary text-body-medium">{phaseTitle}</p>
      <p className="text-typeface_secondary text-body-medium">{time}</p>
    </div>
  );
}
