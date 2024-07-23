export default function ClassItemDetailed({ number, title, description }) {
  return (
    <div className="space-y-[12px]">
      <div className="flex items-center gap-[12px] text-typeface_primary text-body-semibold">
        <div className="relative h-[24px] w-[24px]">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              width="24"
              height="24"
              rx="12"
              fill="var(--surface_bg_secondary)"
            />
          </svg>
          <p className="text-body-semibold center-atop-svg">{number}</p>
        </div>
        {title}
      </div>
      <p className="text-typeface_secondary text-body-regular">{description}</p>
    </div>
  );
}
