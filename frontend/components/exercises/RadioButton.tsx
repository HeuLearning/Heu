import styles from "./RadioButton.module.css";

export default function RadioButton() {
  return (
    <input type="radio" className={`appearance-none ${styles.radioButton}`} />
  );
}
