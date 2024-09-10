import Button from "../buttons/Button";

export default function ButtonBar({
  primaryButtonText,
  primaryButtonClassName = "",
  primaryButtonOnClick,
  secondaryButtonText = "",
  secondaryButtonClassName = "",
  secondaryButtonOnClick = null,
  secondaryContent = null,
}) {
  return (
    <div className="z-25 fixed bottom-0 flex h-[65px] w-full items-center justify-center border-t-[1px] border-surface_border_tertiary bg-white p-[8px] shadow-200">
      <div className="flex w-full items-center gap-[8px]">
        {secondaryButtonText && (
          <Button
            className={`button-secondary w-1/3 rounded-[10px] ${secondaryButtonClassName}`}
            onClick={secondaryButtonOnClick}
          >
            {secondaryButtonText}
          </Button>
        )}
        {secondaryContent && <div>{secondaryContent}</div>}
        <Button
          onClick={primaryButtonOnClick}
          className={`${
            primaryButtonClassName ? primaryButtonClassName : "button-primary"
          } ${
            secondaryButtonText || secondaryContent ? "w-2/3" : "w-full"
          } rounded-[10px]`}
        >
          {primaryButtonText}
        </Button>
      </div>
    </div>
  );
}
