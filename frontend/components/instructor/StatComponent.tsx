export default function StatComponent({
  heading,
  subheading,
  bgColor,
  children,
}) {
  return (
    <div className="flex gap-[16px]">
      <div className="relative h-[40px] w-[40px]">
        <div className="z-10 center-atop-svg">{children}</div>
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="20" cy="20" r="20" fill={`var(--${bgColor})`} />
        </svg>
      </div>
      <div className="space-y-[3px]">
        <h2 className="text-typeface_primary text-h2">{heading}</h2>
        <h2 className="text-typeface_secondary text-body-medium-cap-height">
          {subheading}
        </h2>
      </div>
    </div>
  );
}
