import React from "react";
import { useResponsive } from "../ResponsiveContext";

interface ToggleButtonProps {
  buttonOptions: string[];
  selected: string;
  onToggle: (buttonText: string) => void;
}

export default function ToggleButton({ buttonOptions, selected, onToggle }: ToggleButtonProps) {
  const handleToggle = (buttonText: string) => {
    onToggle(buttonText);
  };

  const { isMobile } = useResponsive();

  const selectedIndex = buttonOptions.indexOf(selected);

  return (
    <div className="relative flex w-full rounded-[10px] bg-surface_bg_secondary p-[2px]">
      {/* Sliding background */}
      <div
        className="absolute bottom-[2px] top-[2px] rounded-[8px] bg-white shadow-50 transition-all duration-200 ease-in-out"
        style={{
          width: `calc(${100 / buttonOptions.length}% - 4px)`,
          left: `calc(${selectedIndex * (100 / buttonOptions.length)}% + 2px)`,
        }}
      />

      {/* Buttons */}
      {buttonOptions.map((buttonText) => {
        const isSelected = buttonText === selected;
        return (
          <button
            key={buttonText}
            className={`
              relative z-10 flex-1 rounded-[8px] ${
                isMobile ? "h-[40px]" : "py-[11px]"
              } 
              text-typeface_primary
              ${
                isSelected
                  ? "text-body-semibold-cap-height"
                  : "text-body-medium-cap-height"
              }
            `}
            onClick={() => handleToggle(buttonText)}
          >
            {buttonText}
          </button>
        );
      })}
    </div>
  );
}
