import Button from "../Button";

interface ButtonBarProps {
  primaryButtonText: string;
  secondaryButtonText?: string;
}

export default function ButtonBar({
  primaryButtonText,
  secondaryButtonText,
}: ButtonBarProps) {
  return (
    <div className="surface_border_tertiary fixed bottom-0 z-50 flex h-[65px] w-full items-center justify-center border-t-[1px] bg-white p-[8px]">
      <div className="flex w-full  gap-[8px]">
        {secondaryButtonText && (
          <Button className="button-secondary h-full w-full rounded-[10px]">
            {secondaryButtonText}
          </Button>
        )}
        <Button className="button-primary h-full w-full rounded-[10px]">
          {primaryButtonText}
        </Button>
      </div>
    </div>
  );
}
