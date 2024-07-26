export default function MobileDetailView({
  backgroundColor,
  className = "",
  children,
}) {
  return (
    <div
      className={`flex h-screen w-screen flex-grow flex-col rounded-t-[20px] outline-surface_border_tertiary ${backgroundColor} ${className}`}
    >
      {children}
    </div>
  );
}
