import React from "react";

export default function ToggleButton({ buttonOptions, selected, onToggle }) {
  const handleToggle = (buttonText) => {
    onToggle(buttonText);
  };

  return (
    <div className="flex w-full rounded-[10px] bg-surface_bg_secondary p-[2px]">
      {buttonOptions.map((buttonText) => {
        const isSelected = buttonText === selected;
        return (
          <button
            key={buttonText}
            className={`
              flex-1 rounded-[8px] py-[11px] 
              text-typeface_primary
              ${
                isSelected
                  ? "rounded-[8px] bg-white shadow-50 text-body-semibold-cap-height"
                  : "bg-surface_bg_secondary text-body-medium-cap-height"
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
