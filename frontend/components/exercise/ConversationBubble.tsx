export default function ConversationBubble({ name, children, side }) {
  if (side === "left") {
    return (
      <div className="h-[40px] rounded-bl-[4px] rounded-br-[14px] rounded-tl-[20px] rounded-tr-[14px] bg-status_bg_info px-[4.5px] py-[4px]">
        <div className="flex h-[32px] items-center">
          <div className="m-[4px] h-[24px] rounded-[12px] bg-status_fg_info px-[8px] py-[7px] text-typeface_highlight text-body-semibold-cap-height">
            {name}
          </div>
          <div className="mx-[10px] my-[11px] flex items-center whitespace-nowrap text-typeface_primary text-body-semibold-cap-height">
            {children}
          </div>
        </div>
      </div>
    );
  } else if (side === "right") {
    return (
      <div className="h-[40px] rounded-bl-[14px] rounded-br-[4px] rounded-tl-[14px] rounded-tr-[20px] bg-surface_bg_secondary px-[4.5px] py-[4px]">
        <div className="flex h-[32px] items-center justify-end">
          <div className="mx-[10px] my-[11px] whitespace-nowrap text-typeface_primary text-body-semibold-cap-height">
            {children}
          </div>
          <div className="m-[4px] h-[24px] rounded-[12px] bg-status_fg_info px-[8px] py-[7px] text-typeface_highlight text-body-semibold-cap-height">
            {name}
          </div>
        </div>
      </div>
    );
  }
}
