export default function ClassItem({ exerciseTitle, time }) {
  return (
    <div className="flex justify-between">
      <p className="text-typeface_primary text-body-medium">{exerciseTitle}</p>
      <p className="text-typeface_secondary text-body-medium">{time}</p>
    </div>
  );
}
