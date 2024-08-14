import Checkbox from "components/exercise/Checkbox";

export default function MenuItem({ checkbox = false, onClick, children }) {
  return (
    <button
      className="menu-item flex w-full items-center justify-center gap-[8px] whitespace-nowrap rounded-[6px] px-[12px] py-[11px]"
      onClick={onClick}
    >
      {checkbox && <Checkbox />}
      <div>{children}</div>
    </button>
  );
}
