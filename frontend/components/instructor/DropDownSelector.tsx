import { useState, useEffect, useRef } from "react";
import Button from "./Button";

export default function DropDownSelector({
  selectedButtonStyling = "",
  selected,
  allOptions,
}) {
  //allOptions in form of ["blah1", "blah2", "blah3"]
  const [isOpen, setIsOpen] = useState(false);
  const [selectedButton, setSelectedButton] = useState(selected);
  const [dropdownWidth, setDropdownWidth] = useState(0);

  const dropdownRef = useRef(null);
  const shownButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (shownButtonRef.current) {
      setDropdownWidth(shownButtonRef.current.offsetWidth);
    }
  }, [selected]);

  const handleSelect = (option) => {
    setSelectedButton(option);
    setIsOpen(false);
  };

  return (
    <div className="relative flex flex-col" ref={dropdownRef}>
      <div
        className={`shown-button  ${selectedButtonStyling}`}
        ref={shownButtonRef}
      >
        <Button
          className="bg-white text-typeface_primary text-body-semibold-cap-height"
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
                  stroke="var(--surface_bg_dark)"
                  stroke-width="2"
                  stroke-linecap="round"
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
                  stroke="var(--surface_bg_dark)"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            )}
          </div>
        </Button>
      </div>
      <div className="drop-down">
        {isOpen ? (
          <div
            style={{ minWidth: `${dropdownWidth}px` }}
            className="absolute z-[100] mt-[4px] flex flex-col rounded-[10px] bg-white p-[4px] drop-shadow-50"
          >
            {allOptions.map((option) => (
              <div key={option} style={{ width: "100%" }}>
                <Button
                  className={`w-full ${
                    selectedButton === option
                      ? "text-typeface_tertiary text-body-semibold-cap-height"
                      : "text-typeface_primary text-body-regular-cap-height"
                  } hover:bg-surface_bg_secondary hover:text-typeface_primary hover:text-body-semibold-cap-height`}
                  onClick={() => handleSelect(option)}
                >
                  <div className="w-full text-left">{option}</div>
                </Button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
