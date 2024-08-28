interface MultipleSelectionButtonProps {
  text: string;
  isSelected: boolean;
  onClick: () => void;
}

const MultipleSelectionButton: React.FC<MultipleSelectionButtonProps> = ({
  text,
  isSelected,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        box-border flex h-[32px] min-w-[80px] items-center justify-center
        overflow-hidden text-ellipsis whitespace-nowrap rounded-[10px] border px-[12px] py-0 
        transition-colors text-body-semibold-cap-height
        ${
          isSelected
            ? "border-transparent bg-action_bg_primary_press text-typeface_highlight"
            : "border-action_border_primary bg-action_bg_secondary text-typeface_primary"
        }
      `}
    >
      {text}
    </button>
  );
};

export default MultipleSelectionButton;
