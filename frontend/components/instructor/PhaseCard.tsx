import CompletionBar from "./CompletionBar";
import InfoCard from "./InfoCard";

export default function PhaseCard({
  type,
  title,
  time,
  percentage,
  onClick = null,
  className = "",
  status = "",
}) {
  let fillColor = "var(--surface_bg_darkest)";
  if (status === "done") fillColor = "var(--surface_bg_dark)";

  let Icon;
  if (type === "practice") {
    Icon = () => (
      <svg
        width="25"
        height="24"
        viewBox="0 0 25 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="0.666748" width="24" height="24" rx="12" fill={fillColor} />
        <path
          d="M8.75024 17.9917C8.3186 17.9155 7.99064 17.7505 7.76636 17.4966C7.54631 17.2427 7.43628 16.902 7.43628 16.4746V7.70215C7.43628 7.37207 7.5061 7.09489 7.64575 6.87061C7.78963 6.64209 7.98641 6.47917 8.23608 6.38184C8.48999 6.28027 8.78198 6.25911 9.11206 6.31836L15.9041 7.51807C16.5727 7.63656 17.072 7.84603 17.4021 8.14648C17.7322 8.44694 17.8972 8.92936 17.8972 9.59375V17.2554C17.8972 17.7378 17.8105 18.1398 17.637 18.4614C17.4635 18.7873 17.2159 19.0158 16.8943 19.147C16.5727 19.2782 16.1897 19.3057 15.7454 19.2295L8.75024 17.9917ZM10.0071 10.1079L14.9202 10.9775C15.0894 11.0072 15.2249 10.9754 15.3264 10.8823C15.428 10.7892 15.4788 10.6665 15.4788 10.5142C15.4788 10.2476 15.3476 10.0868 15.0852 10.0317L10.2039 9.1748C10.0346 9.14518 9.89494 9.1748 9.78491 9.26367C9.67912 9.35254 9.62622 9.47314 9.62622 9.62549C9.62622 9.75244 9.65796 9.86035 9.72144 9.94922C9.78914 10.0381 9.88436 10.091 10.0071 10.1079ZM10.0071 12.7104L14.9202 13.5864C15.0894 13.616 15.2249 13.5843 15.3264 13.4912C15.428 13.3981 15.4788 13.2733 15.4788 13.1167C15.4788 12.8459 15.3476 12.6872 15.0852 12.6406L10.2039 11.7837C10.0346 11.7583 9.89494 11.79 9.78491 11.8789C9.67912 11.9635 9.62622 12.0799 9.62622 12.228C9.62622 12.355 9.66007 12.4629 9.72778 12.5518C9.79549 12.6406 9.88859 12.6935 10.0071 12.7104ZM10.6799 5.69629L14.9392 4.94727C15.7221 4.80762 16.3399 4.89437 16.7927 5.20752C17.2498 5.51644 17.4846 6.01367 17.4973 6.69922L17.5037 7.12451C17.1101 6.90446 16.6298 6.74365 16.0627 6.64209L10.6799 5.69629Z"
          fill="white"
        />
      </svg>
    );
  }
  return (
    <InfoCard
      className={`flex flex-col justify-between gap-[24px] ${
        status === "active" ? "rounded-[10px] shadow-75" : ""
      }`}
      onClick={onClick}
    >
      <div className="space-y-[24px]">
        <Icon />
        <h2
          className={
            status === "done"
              ? "text-typeface_secondary text-body-semibold"
              : "text-typeface_primary text-body-semibold"
          }
        >
          {title}
        </h2>
      </div>
      <div className="flex items-center space-x-[16px] whitespace-nowrap">
        <CompletionBar
          percentage={percentage}
          status={status === "done" ? "done" : ""}
        />
        {status === "done" ? (
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
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <p className="text-typeface_secondary text-body-semibold">Done</p>
          </div>
        ) : (
          <h3
            className={
              status === "active"
                ? "text-typeface_primary text-body-medium"
                : "text-typeface_secondary text-body-medium"
            }
          >
            {time}
          </h3>
        )}
      </div>
    </InfoCard>
  );
}
