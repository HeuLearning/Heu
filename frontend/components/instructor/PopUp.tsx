import XButton from "./XButton";

export default function PopUp({ className = "", children, height = "" }) {
  return (
    <div style={{ minHeight: height }}>
      <div
        className={`z-[50] ${className} flex h-full w-[450px] flex-col rounded-[20px] bg-white p-[24px] outline-surface_border_tertiary drop-shadow-200`}
      >
        {children}
      </div>
    </div>
  );
}
