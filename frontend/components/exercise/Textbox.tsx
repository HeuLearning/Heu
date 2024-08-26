import { useState } from "react";
import styles from "./Textbox.module.css";

export default function Textbox({ size, placeholder, width }) {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const clearInput = () => {
    setInputValue("");
  };

  if (size === "small") {
    return (
      <div className="relative">
        <input
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`${styles.small} text-typeface_primary text-body-medium`}
          style={{ width: width }}
        />
        {inputValue && (
          <button onClick={clearInput}>
            <svg
              className="absolute right-[10px] top-[8px]"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M5.20712 3.79289C4.8166 3.40237 4.18343 3.40237 3.79291 3.79289C3.40238 4.18342 3.40238 4.81658 3.79291 5.20711L6.58582 8.00002L3.79289 10.7929C3.40237 11.1835 3.40237 11.8166 3.79289 12.2072C4.18342 12.5977 4.81658 12.5977 5.20711 12.2072L8.00003 9.41423L10.7929 12.2071C11.1834 12.5976 11.8166 12.5976 12.2071 12.2071C12.5976 11.8166 12.5976 11.1834 12.2071 10.7929L9.41424 8.00002L12.2071 5.20715C12.5976 4.81663 12.5976 4.18346 12.2071 3.79294C11.8166 3.40242 11.1834 3.40242 10.7929 3.79294L8.00003 6.5858L5.20712 3.79289Z"
                fill="var(--surface_bg_darker)"
              />
            </svg>
          </button>
        )}
      </div>
    );
  } else if (size === "big") {
    return (
      <div>
        <textarea
          placeholder={placeholder}
          className={`${styles.big} text-typeface_primary text-body-medium`}
        ></textarea>
      </div>
    );
  }
}
