import MobileDetailView from "./MobileDetailView";
import XButton from "../XButton";

export default function () {
  return (
    <MobileDetailView
      backgroundColor="bg-surface_bg_highlight"
      className="px-[16px] pt-[24px]"
    >
      <div className="flex items-center justify-between">
        <h3 className="p-[8px] text-typeface_primary text-h3">Class details</h3>
        <XButton onClick={""} />
      </div>
    </MobileDetailView>
  );
}
