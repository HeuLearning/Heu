export default function CircledLabel({ bgColor, textColor, children }) {
  return (
    <div className="relative h-[24px] w-[24px]">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="24" height="24" rx="12" fill={bgColor} />
      </svg>
      <p className={`${textColor} text-body-semibold center-atop-svg`}>
        {children}
      </p>
    </div>
  );
}
