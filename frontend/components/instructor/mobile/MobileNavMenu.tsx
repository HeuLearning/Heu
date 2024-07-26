import MobileDetailView from "./MobileDetailView";
import XButton from "../XButton";
import NavButtons from "../NavButtons";

export default function MobileNavMenu({ closeMenu }) {
  return (
    <MobileDetailView
      backgroundColor="bg-surface_bg_tertiary"
      className="px-[24px] pt-[24px]"
    >
      <div className="space-y-[24px]">
        <div className="flex items-center justify-between">
          <h3 className="text-typeface_primary text-h3">Menu</h3>
          <XButton onClick={closeMenu} />
        </div>
        <NavButtons
          buttonOptions={["Dashboard", "Training", "Language", "Profile"]}
          selectedButton="Dashboard"
        />
      </div>
    </MobileDetailView>
  );
}
