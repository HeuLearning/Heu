import Button from "../buttons/Button";

interface ButtonBarProps {
  primaryButtonText: string;
  primaryButtonClassName?: string;
  primaryButtonOnClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  secondaryButtonText?: string;
  secondaryButtonClassName?: string;
  secondaryButtonOnClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  secondaryContent?: React.ReactNode;
  primaryButtonDisabled?: boolean;
}

export default function ButtonBar({
  primaryButtonText,
  primaryButtonClassName = "",
  primaryButtonOnClick,
  primaryButtonDisabled,
  secondaryButtonText = "",
  secondaryButtonClassName = "",
  secondaryButtonOnClick = () => { },
  secondaryContent = null,
}: ButtonBarProps) {
  return (
    <div className="z-25 fixed bottom-0 flex h-[65px] w-full items-center justify-center border-t-[1px] border-surface_border_tertiary bg-white p-[8px] shadow-200">
      <div className="flex w-full items-center justify-between gap-[8px]">
        {secondaryButtonText && (
          <Button
            className={`button-secondary w-1/3 rounded-[10px] ${secondaryButtonClassName}`}
            onClick={secondaryButtonOnClick}
          >
            {secondaryButtonText}
          </Button>
        )}
        {secondaryContent && <div className="w-1/3">{secondaryContent}</div>}
        <div
          className={`${secondaryButtonText || secondaryContent ? "w-2/3" : "w-full"
            }`}
        >
          <Button
            onClick={primaryButtonOnClick}
            className={`${primaryButtonClassName ? primaryButtonClassName : "button-primary"
              } w-full rounded-[10px]`}
            disabled={primaryButtonDisabled}
          >
            {primaryButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
