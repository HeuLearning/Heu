import React from "react";

export default function ToggleButton({ buttonOptions, selected, onToggle }) {
  const handleToggle = (buttonText) => {
    onToggle(buttonText);
  };

  return (
    <div className="inline-flex rounded-[10px] bg-surface_bg_secondary p-[2px]">
      {buttonOptions.map((buttonText) => {
        const isSelected = buttonText === selected;
        return (
          <button
            key={buttonText}
            className={`
              min-w-[139px] flex-1 rounded-[8px] py-[11px] 
              text-typeface_primary text-body-semibold-cap-height 
              ${
                isSelected
                  ? "bg-white font-semibold"
                  : "bg-surface_bg_secondary"
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
