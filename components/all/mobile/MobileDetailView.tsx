import styles from "./MobileDetailView.module.css";
import { useState, useEffect, useRef } from "react";

interface MobileDetailViewProps {
  backgroundColor: string;
  className?: string;
  children: React.ReactNode;
  headerContent?: React.ReactNode;
  buttonBar?: boolean;
  height?: number;
}

export default function MobileDetailView({
  backgroundColor,
  className = "",
  children,
  headerContent = null,
  buttonBar = false,
  height,
}: MobileDetailViewProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  const scrollableRef = useRef<HTMLDivElement>(null);

  // check if scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (scrollableRef.current) {
        const scrollY = scrollableRef.current.scrollTop; // Use scrollTop for the scrollable container
        if (scrollY > 25) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }
      }
    };

    handleScroll(); // Initial check
    const currentScrollable = scrollableRef.current;
    if (currentScrollable === null) return;
    currentScrollable.addEventListener("scroll", handleScroll);
    // Clean up the event listener on component unmount
    return () => {
      currentScrollable.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // button bar = 64
  const windowHeight = window.innerHeight - 64;

  return (
    <div
      style={
        buttonBar
          ? { height: height ? height : windowHeight }
          : { height: height }
      }
      className={`fixed flex flex-grow flex-col rounded-t-[20px] outline-surface_border_tertiary ${backgroundColor} ${className} ${className.includes("bottom-0") ? "bottom-[64px] left-0 right-0" : "inset-0"}`}
    >
      <div
        style={{ "--backgroundColor": backgroundColor } as React.CSSProperties}
        className={`sticky-mobile-detail-view-header pb-[16px] ${
          isScrolled ? styles.stickyHeaderWithBorder : ""
        } sticky top-0 z-50 flex items-center justify-between`}
      >
        {headerContent}
      </div>
      <div className="flex-grow overflow-y-auto pb-[32px]" ref={scrollableRef}>
        {children}
      </div>
    </div>
  );
}
