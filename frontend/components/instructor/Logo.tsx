export default function Logo() {
  return (
    <div
      style={{ width: "40px", height: "40px" }}
      className="relative h-[40px] w-[40px]"
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="20" cy="20" r="16" fill="#AD73CE" />
      </svg>
      <img
        src="/heu-logo-white.png"
        className="z-10 h-[25px] w-[25px] center-atop-svg"
      />
    </div>
  );
}
