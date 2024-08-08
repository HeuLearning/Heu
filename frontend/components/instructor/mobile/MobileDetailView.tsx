import styles from "./MobileDetailView.module.css";
import { useState, useEffect, useRef } from "react";

export default function MobileDetailView({
  backgroundColor,
  className = "",
  children,
  headerContent = null,
  headerContentOnScroll = null,
}) {
  const [stickyTopContent, setStickyTopContent] = useState(headerContent);

  const scrollableRef = useRef(null);

  // scroll sticky content
  if (headerContentOnScroll) {
    useEffect(() => {
      const handleScroll = () => {
        if (scrollableRef.current) {
          const scrollY = scrollableRef.current.scrollTop; // Use scrollTop for the scrollable container
          if (scrollY > 50 && headerContentOnScroll) {
            setStickyTopContent(() => headerContentOnScroll);
          } else {
            setStickyTopContent(() => headerContent);
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
  }

  return (
    <div
      className={`fixed inset-0 flex flex-grow flex-col rounded-t-[20px] outline-surface_border_tertiary ${backgroundColor} ${className}`}
    >
      <div
        className={`sticky-mobile-detail-view-header pb-[16px] ${
          headerContent ? styles.stickyHeader : ""
        } sticky top-0 z-50 flex items-center justify-between ${
          headerContentOnScroll && stickyTopContent === headerContentOnScroll
            ? styles.stickyHeaderWithBorder
            : ""
        }`}
      >
        {stickyTopContent}
      </div>
      <div className="flex-grow overflow-y-auto" ref={scrollableRef}>
        {children}
      </div>
    </div>
  );
}
