import styles from "./maskable-word.module.css";
import React from "react";

// Declaring type of props - see "Typing Component Props" for more examples
type AppProps = {
  word: string;
  index: number;
  masked: boolean;
  maskWord: (word: string, index: number) => void;
  unMaskWord: (word: string, index: number) => void;
}; /* use `interface` if exporting so that consumers can extend */

// Easiest way to declare a Function Component; return type is inferred.
const MaskableWord = ( props: AppProps) => {

  if (props.masked) {
    return (
      <button className={styles.maskedWord} onClick={() => {props.unMaskWord(props.word, props.index)}}>{props.word}</button>
  );
  }
  return <button onClick={() => {props.maskWord(props.word, props.index)}}>{props.word}</button>
  
};


export default MaskableWord;
