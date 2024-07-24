export default function Logo() {
  return (
    <div>
      <div
        style={{ width: "32px", height: "32px" }}
        className="relative h-[32px] w-[32px]"
      >
        <img
          src="/heu-logo-white.png"
          className="z-10 h-[25px] w-[25px] center-atop-svg"
        />
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="#AD73CE" />
        </svg>
      </div>
    </div>
  );
}
