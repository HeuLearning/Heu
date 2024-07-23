import InfoCard from "./InfoCard";
import Button from "./Button";

export default function ModuleDetail({
  active,
  number,
  title,
  description,
  duration,
  completion,
}) {
  const done = completion >= duration;
  return active ? (
    <InfoCard className="ml-[16px] flex flex-col gap-[8px] px-[12px] py-[14px]">
      <div className="flex items-center gap-[12px]">
        <div className="relative h-[24px] w-[24px]">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              width="24"
              height="24"
              rx="12"
              fill="var(--surface_bg_dark)"
            />
          </svg>
          <p className="text-typeface_highlight text-body-semibold center-atop-svg">
            {number}
          </p>
        </div>
        <p className="text-typeface_primary text-body-semibold">{title}</p>
      </div>
      <div className="pl-[36px] text-typeface_primary text-body-regular">
        {description}
      </div>
      <div className="flex items-center justify-end gap-[16px]">
        <div className="flex items-center gap-[6px]">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12ZM5.25 2V6V6.31066L5.46967 6.53033L7.96967 9.03033L9.03033 7.96967L6.75 5.68934V2H5.25Z"
              fill="#404040"
            />
          </svg>
          <div className="text-typeface_primary text-body-semibold">
            {duration - completion} mins left
          </div>
        </div>
        <Button
          className={`bg-surface_bg_secondary text-body-semibold-cap-height ${
            completion / duration < 0.8 // If completion is less than 80%
              ? "button-disabled"
              : "text-typeface_primary"
          }`}
        >
          Next module
        </Button>
      </div>
    </InfoCard>
  ) : done ? (
    <div className="flex justify-between pr-[20px]">
      <div className="flex items-center gap-[12px] pl-[28px]">
        <div className="relative h-[24px] w-[24px]">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              width="24"
              height="24"
              rx="12"
              fill="var(--surface_bg_secondary)"
            />
          </svg>
          <p className="text-typeface_secondary text-body-semibold center-atop-svg">
            {number}
          </p>
        </div>
        <p className="text-typeface_secondary text-body-semibold">{title}</p>
        <p className="text-typeface_secondary text-body-regular">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-[7.5px]">
        <svg
          width="12"
          height="9"
          viewBox="0 0 12 9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1.5 4L4.5 7L10.5 1"
            stroke="#999999"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>

        <p className="text-typeface_secondary text-body-semibold">Done</p>
      </div>
    </div>
  ) : (
    <div className="flex items-center gap-[12px] pl-[28px]">
      <div className="relative h-[24px] w-[24px]">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            width="24"
            height="24"
            rx="12"
            fill="var(--surface_bg_secondary)"
          />
        </svg>
        <p className="text-typeface_primary text-body-semibold center-atop-svg">
          {number}
        </p>
      </div>
      <p className="text-typeface_primary text-body-semibold">{title}</p>
      <p className="text-typeface_secondary text-body-regular">{description}</p>
    </div>
  );
}
