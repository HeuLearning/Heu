import ToggleButton from "./ToggleButton";
import DateCard from "./DateCard";
import MiniClassBlock from "./MiniClassBlock";
import Divider from "./Divider";
import Calendar from "./Calendar";
import { useState } from "react";

export default function CalendarContainer() {
  return (
    <div id="calendar-container" className="relative w-[330px]">
      <div className="flex flex-col gap-[16px] rounded-tl-[10px] rounded-tr-[10px] border-[1px] border-surface_border_secondary bg-surface_bg_tertiary p-[24px]">
        <Calendar />
      </div>
      <div className="flex flex-col space-y-[24px] rounded-bl-[10px] rounded-br-[10px] border-b-[1px] border-l-[1px] border-r-[1px] border-surface_border_secondary bg-surface_bg_tertiary pb-[9.5px] pl-[24px] pr-[24px] pt-[24px]">
        <p className="text-typeface_secondary text-body-semibold">Coming up</p>
        <div className="upcoming-events">
          <MiniClassBlock
            dateCard={true}
            date={["Thursday", "June", "20"]}
            startTime="10AM"
            endTime="11AM"
            status="Online"
          />
          <Divider />
          <MiniClassBlock
            date={["Friday", "June", "21"]}
            startTime="9AM"
            endTime="10AM"
            status="Confirmed"
          />
          <Divider />
          <MiniClassBlock
            date={["Friday", "June", "21"]}
            startTime="10AM"
            endTime="11AM"
            status="Pending"
          />
        </div>
      </div>
    </div>
  );
}
