import { useEffect, useRef, useState } from "react";
import styles from "./SidePopUp.module.css";

export default function SidePopUp({
  headerContent,
  className = "",
  children,
  height = "",
}) {
  const [isScrolled, setIsScrolled] = useState(false);

  const scrollableRef = useRef(null);

  // scroll sticky content
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

  return (
    <div style={{ minHeight: height }}>
      <div
        className={`z-[50] ${className} flex h-full w-[450px] flex-col rounded-[20px] bg-white shadow-200 outline-surface_border_tertiary`}
      >
        <div className="px-[24px] pt-[24px]">
          <div
            className={`${isScrolled ? styles.stickyHeaderWithBorder : ""} ${
              styles.sticky_header
            }`}
          >
            <div className="pb-[24px]">{headerContent}</div>
          </div>
        </div>
        <div
          className="overflow-y-auto pb-[32px] hide-default-scrollbar"
          ref={scrollableRef}
        >
          <div className="px-[24px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
