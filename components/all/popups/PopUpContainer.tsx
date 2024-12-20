import Button from "../buttons/Button";
import IconButton from "../buttons/IconButton";
import { usePopUp } from "./PopUpContext";

interface PopUpContainerProps {
  header: string;
  className?: string;
  children: React.ReactNode;
  primaryButtonText: string;
  primaryButtonDisabled?: boolean;
  secondaryButtonText?: string;
  primaryButtonOnClick?: () => void;
  secondaryButtonOnClick?: () => void;
  popUpId: string;
  closeButton?: boolean;
}

export default function PopUpContainer({
  header,
  className,
  children,
  primaryButtonText,
  primaryButtonDisabled,
  primaryButtonOnClick,
  secondaryButtonText,
  secondaryButtonOnClick,
  popUpId,
  closeButton = true,
}: PopUpContainerProps) {
  const { hidePopUp } = usePopUp();
  return (
    <div>
      <div className={`z-[50] ${className} flex h-full w-full max-w-md flex-col rounded-[20px] bg-white p-6 shadow-200 outline-surface_border_tertiary`}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-typeface_primary text-h3">{header}</h3>
            {closeButton && secondaryButtonText !== "Cancel" && (
              <IconButton onClick={() => hidePopUp(popUpId)}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.20712 3.79289C4.8166 3.40237 4.18343 3.40237 3.79291 3.79289C3.40238 4.18342 3.40238 4.81658 3.79291 5.20711L6.58582 8.00002L3.79289 10.7929C3.40237 11.1835 3.40237 11.8166 3.79289 12.2072C4.18342 12.5977 4.81658 12.5977 5.20711 12.2072L8.00003 9.41423L10.7929 12.2071C11.1834 12.5976 11.8166 12.5976 12.2071 12.2071C12.5976 11.8166 12.5976 11.1834 12.2071 10.7929L9.41424 8.00002L12.2071 5.20715C12.5976 4.81663 12.5976 4.18346 12.2071 3.79294C11.8166 3.40242 11.1834 3.40242 10.7929 3.79294L8.00003 6.5858L5.20712 3.79289Z"
                    fill="currentColor"
                  />
                </svg>
              </IconButton>
            )}
          </div>
        </div>
        <div className="pt-4">{children}</div>
        <div className="flex justify-end gap-3 pt-8">
          {secondaryButtonText && (
            <Button
              className="button-secondary"
              onClick={secondaryButtonOnClick}
            >
              {secondaryButtonText}
            </Button>
          )}
          {primaryButtonText && (
            <Button
              className="button-primary"
              disabled={primaryButtonDisabled}
              onClick={primaryButtonOnClick}
            >
              {primaryButtonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
