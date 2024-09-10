import Button from "../buttons/Button";
import Dot from "../Dot";

export default function ButtonBar({
  status = "",
  primaryButtonText,
  primaryButtonClassName = "",
  primaryButtonOnClick,
  secondaryButtonText = "",
  secondaryButtonClassName = "",
  secondaryButtonOnClick = null,
  secondaryContent = null,
  disabled = false,
}) {
  if (
    status === "Confirmed" ||
    status === "Canceled" ||
    status === "Waitlisted"
  ) {
    return (
      <div className="z-25 fixed bottom-0 flex h-[65px] w-full items-center justify-center border-t-[1px] border-surface_border_tertiary bg-white p-[8px] shadow-200">
        <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-action_bg_tertiary">
          <Dot status={status} />
          <p className="text-typeface_primary text-body-semibold">{status}</p>
        </div>
      </div>
    );
  }
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
            disabled
              ? "button-disabled"
              : primaryButtonClassName
              ? primaryButtonClassName
              : "button-primary"
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
