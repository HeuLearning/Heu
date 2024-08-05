import CircledLabel from "./CircledLabel";

export default function ClassItemDetailed({ number, title, description }) {
  return (
    <div className="space-y-[12px]">
      <div className="flex items-center gap-[12px] text-typeface_primary text-body-semibold">
        <div className="relative h-[24px] w-[24px]">
          <CircledLabel
            bgColor={"var(--surface_bg_secondary)"}
            textColor={"text-typeface_primary"}
          >
            {number}
          </CircledLabel>
        </div>
        {title}
      </div>
      <p className="text-typeface_secondary text-body-regular">{description}</p>
    </div>
  );
}
