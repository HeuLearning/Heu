import Button from "../all/buttons/Button";
import { useResponsive } from "../all/ResponsiveContext";

export default function Instruction({ instruction }) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  return (
    <div>
      <h2 className="text-typeface_primary text-h3">{instruction}</h2>
      {!isMobile && (
        <div className="self-end">
          <Button className="button-primary">Continue</Button>
        </div>
      )}
    </div>
  );
}
