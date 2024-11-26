import Button from "../all/buttons/Button";
import { useResponsive } from "../all/ResponsiveContext";

interface MultipleSelectionButtonProps {
  text: string;
  isSelected: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const MultipleSelectionButton: React.FC<MultipleSelectionButtonProps> = ({
  text,
  isSelected,
  onClick,
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  return (
    <button
      onClick={onClick}
      className={`box-border flex ${isMobile ? "h-[44px]" : "h-[32px]"} items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap rounded-[10px] border px-[12px] pt-[1.12px] transition-colors ${
        isSelected
          ? "border-transparent bg-action_bg_primary_press text-typeface_highlight"
          : "border-action_border_primary bg-action_bg_secondary text-typeface_primary"
      } `}
    >
      <p className="items-center text-body-semibold-cap-height">{text}</p>
    </button>
  );
};

export default MultipleSelectionButton;
