import { forwardRef } from "react";
import styles from "./RadioButton.module.css";

interface RadioButtonProps {
  label: string;
  className?: string;
  name: string;
  value?: string;
  checked?: boolean;
  onChange?: any;
  ref?: React.RefObject<HTMLDivElement>;
}

const RadioButton = forwardRef<HTMLDivElement, RadioButtonProps>(
  ({ label, className = "", name, value, checked, onChange }, ref) => {
    return (
      <div ref={ref}>
        <label
          className={`${className} flex cursor-pointer items-center text-typeface_primary text-body-regular-cap-height`}
        >
          <input
            name={name}
            type="radio"
            value={value}
            checked={checked}
            className={`appearance-none ${styles.radioButton}`}
            onChange={onChange}
          />
          <span>{label}</span>
        </label>
      </div>
    );
  },
);

export default RadioButton;
