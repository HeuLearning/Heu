import CalendarContainer from "./CalendarContainer";
import SessionDetailViewContainer from "./SessionDetailViewContainer";

export default function DashboardContainer() {
  return (
    <div
      id="dashboard-container"
      className="relative mb-4 ml-4 mr-4 flex min-h-[600px] rounded-[20px] bg-surface_bg_highlight p-[10px]"
    >
      <div className="flex-grow">
        <CalendarContainer />
      </div>
      <div className="flex-grow">
        <SessionDetailViewContainer />
      </div>
    </div>
  );
}
