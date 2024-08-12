import styles from "./Checkbox.module.css";

export default function Checkbox() {
  return (
    <div className="flex h-[18px] w-[18px] items-center justify-center">
      <input type="checkbox" className={`${styles.checkbox} appearance-none`} />
    </div>
  );
}
