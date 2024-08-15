import Button from "../Button";

export default function ButtonBar({
  primaryButtonText,
  secondaryButtonText = "",
  primaryButtonOnClick,
  secondaryButtonOnClick = null,
}) {
  return (
    <div className="z-25 border-t-1px fixed bottom-0 flex h-[65px] w-full items-center justify-center border-surface_border_tertiary bg-white p-[8px] shadow-200">
      <div className="flex w-full  gap-[8px]">
        {secondaryButtonText && (
          <Button className="button-secondary w-full rounded-[10px]">
            {secondaryButtonText}
          </Button>
        )}
        <Button
          onClick={primaryButtonOnClick}
          className="button-primary w-full rounded-[10px]"
        >
          {primaryButtonText}
        </Button>
      </div>
    </div>
  );
}
