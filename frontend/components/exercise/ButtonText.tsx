interface ButtonTextProps {
  text: string;
  isSelected: boolean;
  onClick: () => void;
}

const ButtonText: React.FC<ButtonTextProps> = ({
  text,
  isSelected,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        box-border flex h-8 min-w-[80px] items-center justify-center
        overflow-hidden text-ellipsis whitespace-nowrap rounded-[10px] border px-3 py-0 font-semibold tracking-[-0.02em] transition-colors
        font-sans text-sm leading-[16.94px]
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

export default ButtonText;
