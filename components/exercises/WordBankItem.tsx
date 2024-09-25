import Badge from "../../components/all/Badge";
import Droppable from "./Droppable";
import Draggable from "./Draggable";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import RadioButton from "./RadioButton";
import Checkbox from "./Checkbox";
import IconButton from "../../components/all/buttons/IconButton";
import { useResponsive } from "../all/ResponsiveContext";

interface WordBankItemProps {
  id: string;
  draggable?: boolean;
  droppable?: boolean;
  children?: React.ReactNode;
  x?: boolean;
  handleReset?: (id: string) => void;
  placeholder?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export default function WordBankItem({
  id,
  draggable = false,
  droppable = false,
  children = null,
  x = false,
  handleReset = () => {},
  placeholder = false,
  disabled,
  onClick,
}: WordBankItemProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if ((!x && !children && !droppable) || (placeholder && droppable))
    return (
      <div className="border-1px min-h-[32px] flex-1 rounded-[10px] outline-dashed-surface_border_primary">
        <Droppable id={id}>
          <div>{"                 "}</div>
        </Droppable>
      </div>
    );

  if (placeholder && !droppable) {
    return (
      <div className="border-1px min-h-[32px] flex-1 rounded-[10px] outline-dashed-surface_border_primary">
        <div>{"                 "}</div>
      </div>
    );
  }

  const content = (
    <div
      className={`${onClick ? "cursor-pointer" : ""} z-2 flex ${isMobile ? "h-[44px]" : "h-[32px]"} items-center rounded-[10px] ${disabled ? "" : "bg-surface_bg_highlight shadow-25"} px-[10px]`}
      onClick={onClick ? onClick : () => {}}
    >
      <div className="flex items-center justify-between gap-[8px]">
        <div className="flex items-center gap-[8px]">
          {draggable ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M9 4C9 4.55228 8.55228 5 8 5C7.44772 5 7 4.55228 7 4C7 3.44772 7.44772 3 8 3C8.55228 3 9 3.44772 9 4ZM9 8C9 8.55228 8.55228 9 8 9C7.44772 9 7 8.55228 7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8ZM8 13C8.55228 13 9 12.5523 9 12C9 11.4477 8.55228 11 8 11C7.44772 11 7 11.4477 7 12C7 12.5523 7.44772 13 8 13Z"
                fill="var(--typeface_primary)"
              />
            </svg>
          ) : null}
          <div
            className={`text-body-semibold-cap-height ${disabled ? "text-typeface_tertiary" : "text-typeface_primary"}`}
          >
            {children}
          </div>
        </div>
        {x ? (
          <IconButton onClick={handleReset}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M5.20712 3.79289C4.8166 3.40237 4.18343 3.40237 3.79291 3.79289C3.40238 4.18342 3.40238 4.81658 3.79291 5.20711L6.58582 8.00002L3.79289 10.7929C3.40237 11.1835 3.40237 11.8166 3.79289 12.2072C4.18342 12.5977 4.81658 12.5977 5.20711 12.2072L8.00003 9.41423L10.7929 12.2071C11.1834 12.5976 11.8166 12.5976 12.2071 12.2071C12.5976 11.8166 12.5976 11.1834 12.2071 10.7929L9.41424 8.00002L12.2071 5.20715C12.5976 4.81663 12.5976 4.18346 12.2071 3.79294C11.8166 3.40242 11.1834 3.40242 10.7929 3.79294L8.00003 6.5858L5.20712 3.79289Z"
                fill="currentColor"
              />
            </svg>
          </IconButton>
        ) : null}
      </div>
    </div>
  );

  if (droppable)
    return (
      <div className="border-1px min-h-[32px] flex-1 rounded-[10px] bg-surface_bg_highlight outline-dashed-surface_border_primary">
        <Droppable id={id}>
          <div>{"                 "}</div>
        </Droppable>
      </div>
    );

  const handleDragEnd = (event) => {
    console.log("drag end");
  };

  const handleDragDropReset = (id) => {
    console.log("reset");
  };

  return draggable ? (
    <Draggable id={id} className="isolate">
      {content}
    </Draggable>
  ) : (
    content
  );
}
