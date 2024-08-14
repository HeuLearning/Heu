import { useState, useEffect, useRef } from "react";
import AudioButton from "./AudioButton";
import { useResponsive } from "../instructor/ResponsiveContext";
import AudioPlayer2 from "./AudioPlayer2";

export default function AudioPlayer({ audioSrc, title }) {
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (isMobile) {
    return <AudioPlayer2 audioSrc={audioSrc} title={title}></AudioPlayer2>;
  }

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const audio = new Audio(audioSrc);
    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });
    const updateInterval = setInterval(() => {
      if (!audio.paused) {
        setCurrentTime(audio.currentTime);
      }
    }, 50);
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setCurrentTime(audio.duration);
    });
    audioRef.current = audio;

    return () => {
      audio.removeEventListener("loadedmetadata", () => {});
      clearInterval(updateInterval);
      audio.removeEventListener("ended", () => {});
      audio.pause();
    };
  }, [audioSrc]);

  const radius = 62;
  const dashArray = radius * Math.PI * 2;
  const lastValidDashOffset = useRef(dashArray);
  const calculatedDashOffset =
    dashArray - dashArray * Math.min(currentTime / duration, 1);
  const dashOffset = isNaN(calculatedDashOffset)
    ? lastValidDashOffset.current
    : calculatedDashOffset;
  lastValidDashOffset.current = dashOffset;

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative h-[128px] w-[128px]">
      <div className="relative flex h-[128px] w-[128px] items-center justify-center">
        <svg
          className="absolute center-atop-svg"
          width="128"
          height="128"
          viewBox="0 0 128 128"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx={64}
            cy={64}
            r={radius}
            strokeWidth="2px"
            stroke="var(--surface_bg_secondary)"
            fill="var(--surface_bg_highlight)"
          />
          <circle
            cx={64}
            cy={64}
            r={radius}
            strokeWidth="2px"
            stroke="var(--surface_bg_dark)"
            style={{
              strokeDasharray: dashArray,
              strokeDashoffset: dashOffset,
              transition: "stroke-dashoffset 0.05s linear",
            }}
            transform={`rotate(-90 64 64)`}
          />
        </svg>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <AudioButton size={40} togglePlay={togglePlay} isPlaying={isPlaying} />
      </div>
      <div className="absolute bottom-[22px] left-0 flex w-full items-center justify-center">
        <p
          className={`text-medium text-[12px] ${
            isPlaying ? "text-typeface_primary" : "text-typeface_secondary"
          }`}
        >
          {formatTime(currentTime)}
        </p>
      </div>
    </div>
  );
}
