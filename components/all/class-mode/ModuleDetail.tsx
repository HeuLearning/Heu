import styles from "./ModuleDetail.module.css";
import Badge from "../Badge";
import { useResponsive } from "../ResponsiveContext";

interface ModuleDetailProps {
  active: boolean;
  number: number;
  title: string;
  description: string;
  done?: boolean;
}

export default function ModuleDetail({
  active,
  number,
  title,
  description,
  done,
}: ModuleDetailProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  return active ? (
    <div
      className={`${
        isMobile ? styles.module_detail_mobile : styles.module_detail_desktop
      } mb-[4px] flex flex-col gap-[8px] rounded-[10px] bg-white`}
    >
      <div className="flex items-center gap-[12px]">
        <Badge
          bgColor={"var(--surface_bg_darkest)"}
          textColor={"text-typeface_highlight"}
        >
          {number}
        </Badge>
        <p className="text-typeface_primary text-body-semibold">{title}</p>
      </div>
      <div className="pl-[36px] text-typeface_primary text-body-regular">
        {description}
      </div>
    </div>
  ) : (
    <div className="flex flex-col gap-[12px]">
      <div className="flex items-center justify-between pr-[8px]">
        <div className="flex items-center gap-[12px]">
          <Badge
            bgColor={"var(--surface_bg_secondary)"}
            textColor={
              done ? "text-typeface_secondary" : "text-typeface_primary"
            }
          >
            {number}
          </Badge>
          <p
            className={
              done
                ? "text-typeface_secondary text-body-semibold"
                : "text-typeface_primary text-body-semibold"
            }
          >
            {title}
          </p>
        </div>
        {done ? (
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
                stroke="var(--typeface_secondary)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <p className="text-typeface_secondary text-body-semibold">Done</p>
          </div>
        ) : null}
      </div>
      <p className="text-typeface_secondary text-body-regular">{description}</p>
    </div>
  );
}
