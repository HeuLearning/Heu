import { useState, useEffect, useRef } from "react";
import Button from "./Button";

interface LanguageSelectorProps {
  className?: string;
  selected: string;
  allOptions: [string, string][]; // [language, abbr]
}

export default function LanguageSelector({
  className = "",
  selected,
  allOptions,
}: LanguageSelectorProps) {

  const [isOpen, setIsOpen] = useState(false);
  const [selectedButton, setSelectedButton] = useState(selected);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (dropdownRef.current && event.target instanceof Node && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option: string) => {
    setSelectedButton(option);
    setIsOpen(false);
  };

  return (
    <div className="relative flex flex-col" ref={dropdownRef}>
      <div className="shown-button">
        <Button
          className={`${className} language-selector h-8 w-16 ${
            isOpen ? "bg-action_bg_tertiary" : "bg-white"
          } text-typeface_primary text-body-semibold-cap-height`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-[10px]">
            {selectedButton}
            {isOpen ? (
              <svg
                width="10"
                height="7"
                viewBox="0 0 10 7"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.5 5.5L5 2L1.5 5.5"
                  stroke="var(--surface_bg_darkest)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                width="10"
                height="7"
                viewBox="0 0 10 7"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.5 1.5L5 5L8.5 1.5"
                  stroke="var(--surface_bg_darkest)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
        </Button>
      </div>
      <div className="drop-down">
        {isOpen ? (
          <div className="absolute z-[100] mt-[4px] flex flex-col rounded-[10px] bg-white p-[4px]">
            {allOptions.map(([language, abbr]) => (
              <div key={abbr} style={{ width: "100%" }}>
                <Button
                  className={`w-full ${
                    selectedButton === abbr
                      ? "text-typeface_tertiary text-body-semibold-cap-height"
                      : "text-typeface_primary text-body-regular-cap-height"
                  } hover:bg-surface_bg_secondary hover:text-typeface_primary hover:text-body-semibold-cap-height`}
                  onClick={() => handleSelect(abbr)}
                >
                  <div className="flex w-full justify-between gap-[8px]">
                    <p>{language}</p>
                    <p>{abbr}</p>
                  </div>
                </Button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
