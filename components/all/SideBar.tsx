interface SideBarProps {
  className?: string;
  children: React.ReactNode;
}

export default function SideBar({ className = "", children }: SideBarProps) {
  return (
    <div
      className={`max-w-[330px] rounded-[10px] bg-surface_bg_tertiary p-[24px] outline-surface_border_tertiary ${className}`}
    >
      {children}
    </div>
  );
}
