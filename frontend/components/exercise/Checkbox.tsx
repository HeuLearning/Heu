import styles from "./Checkbox.module.css";

export default function Checkbox() {
  return (
    <input type="checkbox" className={`${styles.checkbox} appearance-none`} />
  );
}
