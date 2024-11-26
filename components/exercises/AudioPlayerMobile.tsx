import { useState, useEffect, useRef } from "react";

interface AudioButtonProps {
  size: number;
  togglePlay: () => void;
  isPlaying: boolean;
}

const AudioButton = ({ size, togglePlay, isPlaying }: AudioButtonProps) => (
  <button
    onClick={togglePlay}
    className="flex h-full w-full items-center justify-center focus:outline-none"
  >
    {isPlaying ? (
      <svg
        width="10"
        height="12"
        viewBox="0 0 10 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.60938 11.9023C1.28125 11.9023 1.03516 11.8203 0.871094 11.6562C0.711589 11.4922 0.631836 11.2461 0.631836 10.918V1.2041C0.631836 0.880534 0.713867 0.636719 0.87793 0.472656C1.04199 0.308594 1.28581 0.226562 1.60938 0.226562H3.21582C3.53483 0.226562 3.77637 0.306315 3.94043 0.46582C4.10905 0.625326 4.19336 0.871419 4.19336 1.2041V10.918C4.19336 11.2461 4.10905 11.4922 3.94043 11.6562C3.77637 11.8203 3.53483 11.9023 3.21582 11.9023H1.60938ZM6.79102 11.9023C6.46289 11.9023 6.2168 11.8203 6.05273 11.6562C5.88867 11.4922 5.80664 11.2461 5.80664 10.918V1.2041C5.80664 0.880534 5.88867 0.636719 6.05273 0.472656C6.2168 0.308594 6.46289 0.226562 6.79102 0.226562H8.38379C8.71191 0.226562 8.95801 0.306315 9.12207 0.46582C9.28613 0.625326 9.36816 0.871419 9.36816 1.2041V10.918C9.36816 11.2461 9.28613 11.4922 9.12207 11.6562C8.95801 11.8203 8.71191 11.9023 8.38379 11.9023H6.79102Z"
          fill="white"
        />
      </svg>
    ) : (
      <svg
        width="16"
        height="14"
        viewBox="0 0 16 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.55566 13.1895C7.38249 13.1895 7.21842 13.1507 7.06348 13.0732C6.90853 13.0003 6.74674 12.8841 6.57812 12.7246L3.7207 10.0176C3.67513 9.98112 3.62272 9.96289 3.56348 9.96289H1.62207C1.12533 9.96289 0.742513 9.82617 0.473633 9.55273C0.20931 9.2793 0.0771484 8.87598 0.0771484 8.34277V5.80664C0.0771484 5.27799 0.20931 4.87695 0.473633 4.60352C0.742513 4.33008 1.12533 4.19336 1.62207 4.19336H3.56348C3.62272 4.19336 3.67513 4.17285 3.7207 4.13184L6.57812 1.45898C6.76953 1.28125 6.93587 1.15365 7.07715 1.07617C7.21842 0.994141 7.37337 0.953125 7.54199 0.953125C7.80632 0.953125 8.02051 1.04199 8.18457 1.21973C8.35319 1.39746 8.4375 1.61393 8.4375 1.86914V12.3076C8.4375 12.5583 8.35547 12.7679 8.19141 12.9365C8.02734 13.1051 7.81543 13.1895 7.55566 13.1895ZM10.8779 10.0996C10.7139 9.99023 10.6182 9.8444 10.5908 9.66211C10.568 9.47982 10.6204 9.29069 10.748 9.09473C10.9349 8.82129 11.0807 8.51139 11.1855 8.16504C11.2904 7.81413 11.3428 7.44727 11.3428 7.06445C11.3428 6.68164 11.2904 6.31478 11.1855 5.96387C11.0853 5.61296 10.9395 5.30306 10.748 5.03418C10.6159 4.84277 10.5635 4.65592 10.5908 4.47363C10.6182 4.28678 10.7139 4.13867 10.8779 4.0293C11.0238 3.93359 11.181 3.90169 11.3496 3.93359C11.5182 3.96549 11.6527 4.05436 11.7529 4.2002C12.0309 4.56934 12.2474 5.00456 12.4023 5.50586C12.5573 6.0026 12.6348 6.52214 12.6348 7.06445C12.6348 7.60677 12.5573 8.1263 12.4023 8.62305C12.2474 9.11979 12.0309 9.55273 11.7529 9.92188C11.6527 10.0723 11.5182 10.1634 11.3496 10.1953C11.181 10.2227 11.0238 10.1908 10.8779 10.0996ZM13.6055 11.9248C13.446 11.8245 13.3548 11.6855 13.332 11.5078C13.3092 11.3255 13.3571 11.1455 13.4756 10.9678C13.8356 10.43 14.1159 9.82617 14.3164 9.15625C14.5169 8.48633 14.6172 7.78906 14.6172 7.06445C14.6172 6.33984 14.5169 5.64258 14.3164 4.97266C14.1204 4.29818 13.8402 3.69434 13.4756 3.16113C13.3525 2.9834 13.3024 2.80566 13.3252 2.62793C13.3525 2.44564 13.446 2.30436 13.6055 2.2041C13.7604 2.10384 13.9222 2.07194 14.0908 2.1084C14.264 2.1403 14.403 2.23372 14.5078 2.38867C14.9544 3.01302 15.2985 3.73307 15.54 4.54883C15.7861 5.36003 15.9092 6.19857 15.9092 7.06445C15.9092 7.93034 15.7861 8.76888 15.54 9.58008C15.2939 10.3867 14.9499 11.1068 14.5078 11.7402C14.403 11.8952 14.264 11.9886 14.0908 12.0205C13.9222 12.0524 13.7604 12.0205 13.6055 11.9248Z"
          fill="white"
        />
      </svg>
    )}
  </button>
);

interface AudioPlayerMobileProps {
  audioSrc: string;
  title: string;
}

export default function AudioPlayerMobile({ audioSrc, title }: AudioPlayerMobileProps) {
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
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

  const radius = 22;
  const circumference = radius * Math.PI * 2;
  const progress = isPlaying ? (currentTime / duration) * circumference : 0;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`relative flex items-center ${
        isPlaying ? "bg-black text-white" : "bg-white text-black"
      } h-[60px] w-[335px] rounded-[10px] border border-[#EDEDED] px-[8px] py-[8px] shadow-md`}
      style={{
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.07)",
      }}
    >
      <div className="relative h-[44px] w-[44px]">
        <svg
          className="absolute left-0 top-0"
          width="44"
          height="44"
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill={isPlaying ? "#404040" : "#292929"}
          />
          {isPlaying && (
            <circle
              cx="22"
              cy="22"
              r={radius}
              stroke="white"
              strokeWidth="2"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              transform="rotate(-90 22 22)"
              style={{
                transition: "stroke-dashoffset 0.05s linear",
              }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <AudioButton
            size={24}
            togglePlay={togglePlay}
            isPlaying={isPlaying}
          />
        </div>
      </div>
      <div className="ml-[12px] h-[22px] flex-grow">
        <p
          className={`font-inter font-semibold text-[16px] leading-[22px] ${
            isPlaying ? "text-[#FFFFFF]" : "text-[#292929]"
          }`}
          style={{ letterSpacing: "-1%" }}
        >
          {title}
        </p>
      </div>
      <div className="absolute right-[16px] h-[26px] w-[32px]">
        <p
          className={`font-inter font-normal text-[16px] leading-[26px] ${
            isPlaying ? "text-[#FFFFFF]" : "text-[#999999]"
          }`}
          style={{ letterSpacing: "-1%" }}
        >
          {formatTime(currentTime)}
        </p>
      </div>
    </div>
  );
}
