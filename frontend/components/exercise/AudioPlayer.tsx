import { useState, useEffect, useRef } from "react";
import AudioButton from "./AudioButton";

export default function AudioPlayer({ audioSrc }) {
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

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
    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });
    audioRef.current = audio;

    return () => {
      audio.removeEventListener("loadedmetadata", () => {});
      audio.removeEventListener("timeupdate", () => {});
      audio.pause();
    };
  }, [audioSrc]);

  const radius = 62;
  const dashArray = radius * Math.PI * 2;
  const dashOffset = dashArray - (dashArray * (currentTime / duration)) / 100;

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative h-[128px] w-[128px]">
      <div className="relative flex h-[128px] w-[128px] items-center">
        <svg
          className={`absolute center-atop-svg`}
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
            fill="#a9d8e9"
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 100 100)"
          />
          <circle
            cx={64}
            cy={64}
            r={radius}
            strokeWidth="2px"
            stroke="var(--surface_bg_dark)"
            fill="var(--surface_bg_highlight)"
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 100 100)"
          />
        </svg>
      </div>
      <AudioButton size={40} togglePlay={togglePlay} isPlaying={isPlaying} />
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
