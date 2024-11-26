import Badge from "./Badge";

interface ClassItemDetailedProps {
  number: number;
  title: string;
  description: string;
}

export default function ClassItemDetailed({ number, title, description }: ClassItemDetailedProps) {
  return (
    <div className="space-y-[12px]">
      <div className="flex items-center gap-[12px] text-typeface_primary text-body-semibold">
        <div className="relative">
          <Badge
            bgColor={"var(--surface_bg_secondary)"}
            textColor={"text-typeface_primary"}
          >
            {number}
          </Badge>
        </div>
        {title}
      </div>
      <p className="text-typeface_secondary text-body-regular">{description}</p>
    </div>
  );
}
