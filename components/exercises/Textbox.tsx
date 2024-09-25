import React, { useState, useEffect, forwardRef } from "react";
import styles from "./Textbox.module.css";
import IconButton from "../all/buttons/IconButton";
import { useResponsive } from "../all/ResponsiveContext";

interface TextboxProps {
  name?: string;
  size: "small" | "big";
  placeholder: string;
  width: string;
  height?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  password?: boolean;
  ref?: React.RefObject<HTMLDivElement>;
  errorMessage?: string;
}

const Textbox = forwardRef<HTMLDivElement, TextboxProps>(
  (
    {
      name,
      size,
      placeholder,
      width,
      height,
      value,
      onChange,
      required,
      password,
      errorMessage,
    },
    ref,
  ) => {
    const [inputValue, setInputValue] = useState(value);
    const [isPasswordShown, setIsPasswordShown] = useState(false);

    const { isMobile, isTablet, isDesktop } = useResponsive();

    useEffect(() => {
      setInputValue(value);
    }, [value]);

    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      onChange(newValue);
    };

    const clearInput = () => {
      setInputValue("");
      onChange("");
    };

    const togglePassWordVisibility = (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      setIsPasswordShown(!isPasswordShown);
    };

    if (size === "small") {
      return (
        <div className="relative" ref={ref}>
          <div className="relative inline-block">
            <input
              name={name}
              type={password && !isPasswordShown ? "password" : "text"}
              value={inputValue}
              onChange={handleInputChange}
              placeholder={placeholder}
              className={`${styles.small} text-typeface_primary text-body-medium`}
              style={{
                width: `${width}px`,
                height: isMobile ? "44px" : "32px",
                paddingRight: inputValue ? "36px" : "12px", // Adjust padding to accommodate the IconButton
              }}
              required={required}
            />
            {inputValue && (
              <div className="absolute right-[10px] top-1/2 -translate-y-1/2 transform">
                {password ? (
                  <IconButton
                    className="icon-button flex items-center justify-center"
                    onClick={togglePassWordVisibility}
                  >
                    {isPasswordShown ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="var(--typeface_tertiary)"
                        className="bi bi-eye-fill"
                        viewBox="0 0 16 16"
                      >
                        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="var(--typeface_tertiary)"
                        className="bi bi-eye-slash-fill"
                        viewBox="0 0 16 16"
                      >
                        <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z" />
                        <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" />
                      </svg>
                    )}
                  </IconButton>
                ) : (
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
                )}
              </div>
            )}
          </div>
          {errorMessage && (
            <span className="absolute left-[11px] top-full pt-[4px] text-action_bg_destructive text-caption">
              {errorMessage}
            </span>
          )}
        </div>
      );
    } else if (size === "big") {
      return (
        <textarea
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`${styles.big} text-typeface_primary text-body-medium`}
          style={{ width: `${width}px`, height: `${height}px` }}
        ></textarea>
      );
    }

    return null; // Return null for invalid size prop
  },
);

export default Textbox;
