export default function DateCard({ month, day }) {
  return (
    <div className="inline-flex h-[56px] w-[56px] flex-col items-center justify-center space-y-[4px] rounded-[10px] bg-white px-[8px] pb-[8px] pt-[12px] align-middle shadow-200">
      <h1 className="font-semibold uppercase text-[#FE0909] text-[12px] leading-cap-height">
        {month}
      </h1>
      <h1 className="text-typeface_primary leading-[0.8] text-h1">{day}</h1>
    </div>
  );
}
