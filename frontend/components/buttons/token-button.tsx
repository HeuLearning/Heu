import styles from "../componentscss/PageButton.module.css"

type proptype = {
  onClick: (() => (void | null)) | null;
  text: string;
  selected: boolean;
}

export const TokenButton = (props: proptype) => {
  return (
    <button className={props.selected===true ? styles.currentButton : styles.button} onClick={() => props.onClick()}>{props.text}</button>
  );
};
