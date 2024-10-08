import AudioButton from "./AudioButton";
import { useEffect, useState, useRef } from "react";
import Checkbox from "./Checkbox";

interface ImageCardProps {
  imageLink: string;
  audioSrc?: string;
  checkbox?: boolean;
  caption: string;
}

export default function ImageCard({
  imageLink,
  audioSrc = "",
  checkbox = false,
  caption,
}: ImageCardProps) {
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (audioSrc) {
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
  }

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex flex-col gap-[8px]">
      <div className="relative h-[128px] w-[128px]">
        <img
          className="h-full w-full rounded-[10px] object-cover"
          src={imageLink}
        />
        {audioSrc ? (
          <div className="absolute right-[12px] top-[12px]">
            <AudioButton
              size={32}
              togglePlay={togglePlay}
              isPlaying={isPlaying}           />
          </div>
        ) : null}
        {checkbox ? (
          <div className="absolute bottom-[12px] right-[12px]">
            <Checkbox />
          </div>
        ) : null}
      </div>
      <p className="self-center text-typeface_primary text-body-medium">
        {caption}
      </p>
    </div>
  );
}
