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
    <div className="fixed bottom-0 z-50 flex h-[65px] w-full items-center justify-center border-t-[1px] border-surface_border_tertiary bg-white p-[8px] shadow-200">
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
