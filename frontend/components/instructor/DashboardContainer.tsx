import CalendarContainer from "./CalendarContainer";
import SessionDetailViewContainer from "./SessionDetailViewContainer";
import { useResponsive } from "./ResponsiveContext";
import MobileDetailView from "components/instructor/mobile/MobileDetailView";
import MobileDashboard from "components/instructor/mobile/MobileDashboard";

export default function DashboardContainer() {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const upcomingSessions = [
    {
      id: 1,
      dayOfTheWeek: "Wednesday",
      year: 2024,
      month: "July",
      day: 24,
      startTime: "10AM",
      endTime: "11AM",
      status: "Online",
    },
    {
      id: 2,
      dayOfTheWeek: "Thursday",
      year: 2024,
      month: "July",
      day: 25,
      startTime: "10AM",
      endTime: "11AM",
      status: "Confirmed",
    },
    {
      id: 3,
      dayOfTheWeek: "Monday",
      year: 2024,
      month: "July",
      day: 29,
      startTime: "10AM",
      endTime: "11AM",
      status: "Pending",
    },
    {
      id: 4,
      dayOfTheWeek: "Tuesday",
      year: 2024,
      month: "July",
      day: 30,
      startTime: "10AM",
      endTime: "11AM",
      status: "Canceled",
    },
    {
      id: 5,
      dayOfTheWeek: "Thursday",
      year: 2024,
      month: "August",
      day: 1,
      startTime: "10AM",
      endTime: "11AM",
      status: "Confirmed",
    },
    {
      id: 6,
      dayOfTheWeek: "Friday",
      year: 2024,
      month: "August",
      day: 2,
      startTime: "10AM",
      endTime: "11AM",
      status: "Pending",
    },
    {
      id: 7,
      dayOfTheWeek: "Monday",
      year: 2024,
      month: "August",
      day: 5,
      startTime: "10AM",
      endTime: "11AM",
      status: "Pending",
    },
    {
      id: 8,
      dayOfTheWeek: "Tuesday",
      year: 2024,
      month: "August",
      day: 6,
      startTime: "10AM",
      endTime: "11AM",
      status: "Pending",
    },
    {
      id: 9,
      dayOfTheWeek: "Wednesday",
      year: 2024,
      month: "August",
      day: 7,
      startTime: "10AM",
      endTime: "11AM",
      status: "Pending",
    },
    {
      id: 10,
      dayOfTheWeek: "Thursday",
      year: 2024,
      month: "August",
      day: 8,
      startTime: "10AM",
      endTime: "11AM",
      status: "Pending",
    },
    {
      id: 11,
      dayOfTheWeek: "Friday",
      year: 2024,
      month: "August",
      day: 9,
      startTime: "10AM",
      endTime: "11AM",
      status: "Pending",
    },
    {
      id: 12,
      dayOfTheWeek: "Monday",
      year: 2024,
      month: "August",
      day: 12,
      startTime: "10AM",
      endTime: "11AM",
      status: "Pending",
    },
  ];

  if (isMobile) {
    return <MobileDashboard upcomingSessions={upcomingSessions} />;
  } else {
    return (
      <div
        id="dashboard-container"
        className="relative mb-4 ml-4 mr-4 flex min-h-[600px] rounded-[20px] bg-surface_bg_highlight p-[10px]"
      >
        <div className="flex-grow">
          <CalendarContainer upcomingSessions={upcomingSessions} />
        </div>
        <div className="flex-grow">
          <SessionDetailViewContainer />
        </div>
      </div>
    );
  }
}
