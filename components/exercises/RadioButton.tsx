import styles from "./RadioButton.module.css";

export default function RadioButton({ label, className = "", name }) {
  return (
    <div className={`${className} flex items-center`}>
      <input
        name={name}
        type="radio"
        className={`appearance-none ${styles.radioButton}`}
      />
      <label className="text-typeface_primary text-body-regular-cap-height">
        {label}
      </label>
    </div>
  );
}
