import { useState, useEffect, useRef } from "react";

export default function AudioPlayer({ audioSrc, title }) {
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

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const progress = (currentTime / duration) * circumference;

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative h-32 w-32">
      {/* Outer progress bar */}
      <svg
        className="absolute inset-0"
        width="128"
        height="128"
        viewBox="0 0 128 128"
      >
        <circle
          cx="64"
          cy="64"
          r={radius}
          className="fill-none stroke-surface_bg_secondary"
          strokeWidth="4"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          className="fill-none stroke-surface_bg_darker"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          transform="rotate(-90 64 64)"
          style={{ transition: "stroke-dashoffset 0.05s linear" }}
        />
      </svg>

      {/* Inner circle */}
      <div className="absolute inset-0.5 rounded-full bg-white"></div>

      {/* Button with SVG */}
      <button
        onClick={togglePlay}
        className="absolute inset-0 m-auto flex h-11 w-11 items-center justify-center rounded-full bg-action_bg_primary text-action_bg_secondary shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
      >
        {isPlaying ? (
          <svg
            width="8"
            height="10"
            viewBox="0 0 8 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.33594 9.70898C1.07812 9.70898 0.884766 9.64453 0.755859 9.51562C0.630534 9.38672 0.567871 9.19336 0.567871 8.93555V1.30322C0.567871 1.04899 0.632324 0.857422 0.76123 0.728516C0.890137 0.599609 1.08171 0.535156 1.33594 0.535156H2.59814C2.8488 0.535156 3.03857 0.597819 3.16748 0.723145C3.29997 0.84847 3.36621 1.04183 3.36621 1.30322V8.93555C3.36621 9.19336 3.29997 9.38672 3.16748 9.51562C3.03857 9.64453 2.8488 9.70898 2.59814 9.70898H1.33594ZM5.40723 9.70898C5.14941 9.70898 4.95605 9.64453 4.82715 9.51562C4.69824 9.38672 4.63379 9.19336 4.63379 8.93555V1.30322C4.63379 1.04899 4.69824 0.857422 4.82715 0.728516C4.95605 0.599609 5.14941 0.535156 5.40723 0.535156H6.65869C6.9165 0.535156 7.10986 0.597819 7.23877 0.723145C7.36768 0.84847 7.43213 1.04183 7.43213 1.30322V8.93555C7.43213 9.19336 7.36768 9.38672 7.23877 9.51562C7.10986 9.64453 6.9165 9.70898 6.65869 9.70898H5.40723Z"
              fill="currentColor"
            />
          </svg>
        ) : (
          <svg
            width="14"
            height="10"
            viewBox="0 0 14 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.65088 9.93457C6.51481 9.93457 6.3859 9.90413 6.26416 9.84326C6.14242 9.78597 6.0153 9.69466 5.88281 9.56934L3.6377 7.44238C3.60189 7.41374 3.56071 7.39941 3.51416 7.39941H1.98877C1.59847 7.39941 1.29769 7.29199 1.08643 7.07715C0.878743 6.8623 0.774902 6.54541 0.774902 6.12646V4.13379C0.774902 3.71842 0.878743 3.40332 1.08643 3.18848C1.29769 2.97363 1.59847 2.86621 1.98877 2.86621H3.51416C3.56071 2.86621 3.60189 2.8501 3.6377 2.81787L5.88281 0.717773C6.0332 0.578125 6.1639 0.477865 6.2749 0.416992C6.3859 0.352539 6.50765 0.320312 6.64014 0.320312C6.84782 0.320312 7.01611 0.390137 7.14502 0.529785C7.27751 0.669434 7.34375 0.839518 7.34375 1.04004V9.2417C7.34375 9.43864 7.2793 9.60335 7.15039 9.73584C7.02148 9.86833 6.85498 9.93457 6.65088 9.93457ZM9.26123 7.50684C9.13232 7.4209 9.05713 7.30632 9.03564 7.16309C9.01774 7.01986 9.05892 6.87126 9.15918 6.71729C9.30599 6.50244 9.42057 6.25895 9.50293 5.98682C9.58529 5.7111 9.62646 5.42285 9.62646 5.12207C9.62646 4.82129 9.58529 4.53304 9.50293 4.25732C9.42415 3.98161 9.30957 3.73812 9.15918 3.52686C9.05534 3.37646 9.01416 3.22965 9.03564 3.08643C9.05713 2.93962 9.13232 2.82324 9.26123 2.7373C9.37581 2.66211 9.49935 2.63704 9.63184 2.66211C9.76432 2.68717 9.86995 2.757 9.94873 2.87158C10.1672 3.16162 10.3372 3.50358 10.459 3.89746C10.5807 4.28776 10.6416 4.69596 10.6416 5.12207C10.6416 5.54818 10.5807 5.95638 10.459 6.34668C10.3372 6.73698 10.1672 7.07715 9.94873 7.36719C9.86995 7.48535 9.76432 7.55697 9.63184 7.58203C9.49935 7.60352 9.37581 7.57845 9.26123 7.50684ZM11.4043 8.94092C11.279 8.86214 11.2074 8.75293 11.1895 8.61328C11.1715 8.47005 11.2091 8.32861 11.3022 8.18896C11.5851 7.76644 11.8053 7.29199 11.9629 6.76562C12.1204 6.23926 12.1992 5.69141 12.1992 5.12207C12.1992 4.55273 12.1204 4.00488 11.9629 3.47852C11.8089 2.94857 11.5887 2.47412 11.3022 2.05518C11.2056 1.91553 11.1662 1.77588 11.1841 1.63623C11.2056 1.493 11.279 1.382 11.4043 1.30322C11.526 1.22445 11.6532 1.19938 11.7856 1.22803C11.9217 1.25309 12.0309 1.3265 12.1133 1.44824C12.4642 1.9388 12.7345 2.50456 12.9243 3.14551C13.1177 3.78288 13.2144 4.44173 13.2144 5.12207C13.2144 5.80241 13.1177 6.46126 12.9243 7.09863C12.731 7.73242 12.4606 8.29818 12.1133 8.7959C12.0309 8.91764 11.9217 8.99105 11.7856 9.01611C11.6532 9.04118 11.526 9.01611 11.4043 8.94092Z"
              fill="currentColor"
            />
          </svg>
        )}
      </button>

      {/* Time display */}
      <div className="absolute inset-x-0 bottom-4 text-center">
        <p
          className={`font-medium tracking-[-2%] text-sm leading-[17px] ${
            isPlaying ? "text-typeface_primary" : "text-typeface_tertiary"
          }`}
        >
          {formatTime(currentTime)}
        </p>
      </div>
    </div>
  );
}
