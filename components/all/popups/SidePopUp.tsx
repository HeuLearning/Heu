import { ReactNode, useEffect, useRef, useState } from "react";
import styles from "./SidePopUp.module.css";
import Scrollbar from "../Scrollbar";

interface SidePopUpProps {
  headerContent: any;
  className?: any;
  children: any;
  height: any; 
}

export default function SidePopUp({
  headerContent,
  className = "",
  children,
  height,
}: SidePopUpProps) {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [headerHeight, setHeaderHeight] = useState<number>(0);

  // Explicitly typing useRef with null initial value and specific types
  const scrollableRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
    console.log("header height", headerHeight);
  }, [headerContent, headerHeight]);

  // scroll sticky content
  useEffect(() => {
    const handleScroll = () => {
      if (scrollableRef.current) {
        const scrollY = scrollableRef.current.scrollTop; // Use scrollTop for the scrollable container
        setIsScrolled(scrollY > 25);
      }
    };

    handleScroll(); // Initial check
    const currentScrollable = scrollableRef.current;
    if (currentScrollable) {
      currentScrollable.addEventListener("scroll", handleScroll);
    }

    // Clean up the event listener on component unmount
    return () => {
      if (currentScrollable) {
        currentScrollable.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <div style={{ minHeight: height }}>
      <div
        className={`z-[50] ${className} flex h-full w-[450px] flex-col rounded-[20px] bg-white shadow-200 outline-surface_border_tertiary`}
      >
        <div className="px-[24px] pt-[24px]" ref={headerRef}>
          <div
            className={`${isScrolled ? styles.stickyHeaderWithBorder : ""} ${
              styles.sticky_header
            }`}
          >
            <div className="pb-[24px]">{headerContent}</div>
          </div>
        </div>
        <div className="overflow-y-auto">
          {/* 24 = the bottom padding */}
          <Scrollbar
            className="z-100 absolute right-[12px]"
            scrollbarHeight={height - 24 - headerHeight}
            contentRef={scrollableRef}
          >
            <div className="px-[24px] pb-[32px]">{children}</div>
          </Scrollbar>
        </div>
      </div>
    </div>
  );
}
