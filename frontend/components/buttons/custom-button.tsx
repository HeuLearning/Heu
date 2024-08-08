import styles from "../componentscss/CustomButton.module.css"

type proptype = {
  onClick: () => void | null;
  text: string;

}

export const CustomButton = (props: proptype) => {
  return (
    <button className={styles.button} onClick={() => props.onClick()}>{props.text}</button>
  );
};
