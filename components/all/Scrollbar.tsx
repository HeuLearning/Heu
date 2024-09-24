import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import styles from "./Scrollbar.module.css";

interface ScrollbarProps extends React.ComponentPropsWithoutRef<"div"> {
  scrollbarHeight: number;
  contentRef: React.RefObject<HTMLDivElement>;
}

const Scrollbar = ({
  children,
  className,
  scrollbarHeight,
  contentRef,
  ...props
}: ScrollbarProps) => {
  //   const contentRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const scrollThumbRef = useRef<HTMLDivElement>(null);
  const observer = useRef<ResizeObserver | null>(null);
  const [thumbHeight, setThumbHeight] = useState(20);
  const [scrollStartPosition, setScrollStartPosition] = useState<number>(0);
  const [initialScrollTop, setInitialScrollTop] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  const [isHovered, setIsHovered] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

  const handleResize = useCallback(
    (contentRef: HTMLDivElement) => {
      const { clientHeight, scrollHeight } = contentRef;
      const newThumbHeight = Math.max(
        (clientHeight / scrollHeight) * scrollbarHeight,
        20,
      );
      setThumbHeight(newThumbHeight);
    },
    [scrollbarHeight],
  );

  // If the content and the scrollbar track exist, use a ResizeObserver to adjust height of thumb and listen for scroll event to move the thumb
  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (contentRef.current) {
        handleResize(contentRef.current);
        setIsScrollable(
          contentRef.current.scrollHeight > contentRef.current.clientHeight,
        );
      }
    });

    const mutationObserver = new MutationObserver(() => {
      if (contentRef.current) {
        handleResize(contentRef.current);
        setIsScrollable(
          contentRef.current.scrollHeight > contentRef.current.clientHeight,
        );
      }
    });

    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
      mutationObserver.observe(contentRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
      });
    }

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [scrollbarHeight]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.addEventListener("scroll", handleThumbPosition);
      return () => {
        contentRef.current?.removeEventListener("scroll", handleThumbPosition);
      };
    }
  }, []);

  const handleTrackClick = useCallback(
    (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      const { current: trackCurrent } = scrollTrackRef;
      const { current: contentCurrent } = contentRef;
      if (trackCurrent && contentCurrent) {
        const { clientY } = e;
        const target = e.target as HTMLDivElement;
        const rect = target.getBoundingClientRect();
        const trackTop = rect.top;
        const thumbOffset = -(thumbHeight / 2);
        const clickRatio =
          (clientY - trackTop + thumbOffset) / trackCurrent.clientHeight;
        const scrollAmount = Math.floor(
          clickRatio * contentCurrent.scrollHeight,
        );
        contentCurrent.scrollTo({
          top: scrollAmount,
          behavior: "smooth",
        });
      }
    },
    [thumbHeight],
  );

  const handleThumbPosition = useCallback(() => {
    if (
      !contentRef.current ||
      !scrollTrackRef.current ||
      !scrollThumbRef.current
    ) {
      return;
    }
    const { scrollTop: contentTop, scrollHeight: contentHeight } =
      contentRef.current;
    const { clientHeight: trackHeight } = scrollTrackRef.current;
    let newTop = (+contentTop / +contentHeight) * trackHeight;
    newTop = Math.min(newTop, trackHeight - thumbHeight);
    const thumb = scrollThumbRef.current;
    thumb.style.top = `${newTop}px`;
  }, []);

  const handleThumbMousedown = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setScrollStartPosition(e.clientY);
    if (contentRef.current) setInitialScrollTop(contentRef.current.scrollTop);
    setIsDragging(true);
  }, []);

  const handleThumbMouseup = useCallback(
    (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      if (isDragging) {
        setIsDragging(false);
      }
    },
    [isDragging],
  );

  const handleThumbMousemove = useCallback(
    (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      if (isDragging) {
        const {
          scrollHeight: contentScrollHeight,
          offsetHeight: contentOffsetHeight,
        } = contentRef.current as HTMLDivElement;

        const deltaY =
          (e.clientY - scrollStartPosition) *
          (contentOffsetHeight / thumbHeight);
        const newScrollTop = Math.min(
          initialScrollTop + deltaY,
          contentScrollHeight - contentOffsetHeight,
        );

        contentRef.current!.scrollTop = newScrollTop;
      }
    },
    [isDragging, scrollStartPosition, thumbHeight],
  );

  // Listen for mouse events to handle scrolling by dragging the thumb
  useEffect(() => {
    document.addEventListener("mousemove", handleThumbMousemove);
    document.addEventListener("mouseup", handleThumbMouseup);
    document.addEventListener("mouseleave", handleThumbMouseup);
    return () => {
      document.removeEventListener("mousemove", handleThumbMousemove);
      document.removeEventListener("mouseup", handleThumbMouseup);
      document.removeEventListener("mouseleave", handleThumbMouseup);
    };
  }, [handleThumbMousemove, handleThumbMouseup]);

  return (
    <div className={styles.custom_scrollbars__container}>
      <div
        className={styles.custom_scrollbars__content}
        ref={contentRef}
        {...props}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </div>
      {isScrollable ? (
        <div
          className={`${
            styles.custom_scrollbars__track_and_thumb
          } ${className} ${isHovered ? styles.visible : ""}`}
          style={{
            height: scrollbarHeight,
          }}
        >
          <div
            className={`${styles.custom_scrollbars__track}`}
            ref={scrollTrackRef}
            onClick={handleTrackClick}
            style={{ cursor: isDragging ? "grabbing" : undefined }}
          ></div>
          <div
            className={`${styles.custom_scrollbars__thumb}`}
            ref={scrollThumbRef}
            onMouseDown={handleThumbMousedown}
            style={{
              height: `${thumbHeight}px`,
              cursor: isDragging ? "grabbing" : "grab",
            }}
          ></div>
        </div>
      ) : (
        <div
          ref={scrollTrackRef}
          className={`${styles.custom_scrollbars__track_and_thumb}`}
        ></div>
      )}
    </div>
  );
};

export default Scrollbar;
