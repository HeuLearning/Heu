import styles from "../componentscss/PageButton.module.css"

type proptype = {
  onClick: (() => (void | null)) | null;
  text: string;
  selected: boolean | null;
}

export const PageButton = (props: proptype) => {
  return (
    <button className={props.selected===true ? styles.currentButton : styles.button} onClick={() => props.onClick()}>{props.text}</button>
  );
};
