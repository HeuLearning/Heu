import DateCard from "../DateCard";
import MiniClassBlock from "../MiniClassBlock";
import Divider from "../Divider";
import { useState } from "react";
import { useResponsive } from "../ResponsiveContext";
import HorizontalDatePicker from "./HorizontalDatePicker";

const selectedDay = (val) => {
  console.log(val);
};

// this is equivalent to the web DashboardContainer + CalendarContainer, since the dashboard is simply the calendar
export default function MobileDashboard({ upcomingSessions }) {
  return (
    <div className="h-screen w-screen border-[1px] border-t-surface_border_tertiary bg-surface_bg_highlight">
      <HorizontalDatePicker getSelectedDay={selectedDay} labelFormat={"MMMM"} />

      <div>
        <div className="border-[1px] border-surface_bg_secondary"></div>
        <p className="px-[24px] py-[24px] text-typeface_secondary text-body-semibold">
          Coming up
        </p>
        <div className="upcoming-events px-[24px]">
          {/* assumes that past sessions have been removed from array */}
          {upcomingSessions
            .slice(0, Math.min(upcomingSessions.length, 3))
            .map((session, index) =>
              index === 0 ? (
                <MiniClassBlock
                  dateCard={true}
                  date={[session.dayOfTheWeek, session.month, session.day]}
                  startTime={session.startTime}
                  endTime={session.endTime}
                  status={session.status}
                />
              ) : (
                <div>
                  <Divider />
                  <MiniClassBlock
                    key={session.id}
                    date={[session.dayOfTheWeek, session.month, session.day]}
                    startTime={session.startTime}
                    endTime={session.endTime}
                    status={session.status}
                  />
                </div>
              )
            )}
        </div>
      </div>
    </div>
  );
}
