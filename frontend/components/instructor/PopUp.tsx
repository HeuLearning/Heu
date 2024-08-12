import Button from "./Button";
import { usePopUp } from "./PopUpContext";
import XButton from "./XButton";

export default function PopUp({
  header,
  className = "",
  children,
  primaryButtonText,
  secondaryButtonText = "",
  primaryButtonOnClick,
  secondaryButtonOnClick = () => {},
  popUpId,
}) {
  const { hidePopUp } = usePopUp();
  return (
    <div>
      <div
        className={`z-[50] ${className} flex h-full w-[450px] flex-col rounded-[20px] bg-white p-[24px] shadow-200 outline-surface_border_tertiary`}
      >
        <div className="space-y-[12px]">
          <div className="flex items-center justify-between">
            <h3 className="text-typeface_primary text-h3">{header}</h3>
            {secondaryButtonText !== "Cancel" && (
              <XButton
                onClick={() => hidePopUp(popUpId)}
                variation="x-button-secondary"
              />
            )}
          </div>
        </div>
        <div className="pt-[16px]">{children}</div>
        <div className="flex justify-end gap-[12px] pt-[32px]">
          {secondaryButtonText !== "" && (
            <Button
              className="button-secondary"
              onClick={secondaryButtonOnClick}
            >
              {secondaryButtonText}
            </Button>
          )}
          <Button className="button-primary" onClick={primaryButtonOnClick}>
            {primaryButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
