export default function InfoCard({ className = "", onClick = null, children }) {
  return (
    <div
      className={`flex flex-col rounded-[10px] bg-white p-[24px] outline-surface_border_tertiary ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
