import React, { useState, useEffect } from "react";
import styles from "./Textbox.module.css";
import IconButton from "../instructor/IconButton";
import { useResponsive } from "../instructor/ResponsiveContext";

interface TextboxProps {
  size: "small" | "big";
  placeholder: string;
  width: string;
  height: string;
  value: string;
  onChange: (value: string) => void;
}

export default function Textbox({
  size,
  placeholder,
  width,
  height,
  value,
  onChange,
}: TextboxProps) {
  const [inputValue, setInputValue] = useState(value);
  const { isMobile } = useResponsive();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const clearInput = () => {
    setInputValue("");
    onChange("");
  };

  if (size === "small") {
    return (
      <div className="relative" style={{ width }}>
        <input
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`${styles.small} text-typeface_primary text-body-medium`}
          style={{
            paddingRight: inputValue ? "36px" : "12px", // Adjust padding to accommodate the IconButton
          }}
        />
        {inputValue && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 transform">
            <IconButton
              className="icon-button flex items-center justify-center"
              onClick={clearInput}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.20712 3.79289C4.8166 3.40237 4.18343 3.40237 3.79291 3.79289C3.40238 4.18342 3.40238 4.81658 3.79291 5.20711L6.58582 8.00002L3.79289 10.7929C3.40237 11.1835 3.40237 11.8166 3.79289 12.2072C4.18342 12.5977 4.81658 12.5977 5.20711 12.2072L8.00003 9.41423L10.7929 12.2071C11.1834 12.5976 11.8166 12.5976 12.2071 12.2071C12.5976 11.8166 12.5976 11.1834 12.2071 10.7929L9.41424 8.00002L12.2071 5.20715C12.5976 4.81663 12.5976 4.18346 12.2071 3.79294C11.8166 3.40242 11.1834 3.40242 10.7929 3.79294L8.00003 6.5858L5.20712 3.79289Z"
                  fill="var(--surface_bg_darker)"
                />
              </svg>
            </IconButton>
          </div>
        )}
      </div>
    );
  } else if (size === "big") {
    return (
      <div style={{ width }}>
        <textarea
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`${styles.big} text-typeface_primary text-body-medium`}
        ></textarea>
      </div>
    );
  }

  return null; // Return null for invalid size prop
}
