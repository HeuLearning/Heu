import styles from "./MobileDetailView.module.css";
import { useState, useEffect, useRef } from "react";

export default function MobileDetailView({
  backgroundColor,
  className = "",
  children,
  headerContent = null,
  buttonBar = false,
}) {
  const [isScrolled, setIsScrolled] = useState(false);

  const scrollableRef = useRef(null);

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
    currentScrollable.addEventListener("scroll", handleScroll);
    // Clean up the event listener on component unmount
    return () => {
      currentScrollable.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // button bar = 64
  const height = window.innerHeight - 64;

  return (
    <div
      style={buttonBar ? { height: height } : {}}
      className={`fixed inset-0 flex flex-grow flex-col rounded-t-[20px] outline-surface_border_tertiary ${backgroundColor} ${className}`}
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
