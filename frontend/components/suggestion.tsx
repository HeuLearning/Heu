import styles from "./Suggestion.module.css";
import React from "react";
import { type SuggestionModel } from "models/suggestion-model";

// Declaring type of props - see "Typing Component Props" for more examples
type AppProps = {
  word: string;
  suggestions: Array<SuggestionModel>;
  index: number;
  setSuggestions: (suggestions: Array<SuggestionModel>) => void;
}; /* use `interface` if exporting so that consumers can extend */

// Easiest way to declare a Function Component; return type is inferred.
const Suggestion = ( props: AppProps) => {
  return (
      <button className={styles.outerButton} onClick={() => {props.setSuggestions(props.suggestions)}}>{props.word}</button>
  );

  // const toggleExpand = () => {
  //   setExpand(!expand);
  // }
  // if (expand===true) 
  // return (
  //   <div className={styles.outerButton} onClick={toggleExpand}>
  //     {/* <button onClick={toggleExpand}>See Less+</button> */}
  //     <div>{phrase}</div>
  //     <div>τὰ: 90%</div>
  //     <div>ζῷα: 5%</div>
  //     <div>ἐκ: 1%</div>
  //     <div>ταύτης: 0.2%</div>
  //     <div>ἐγγίγνεται: 0.1%</div>
  //   </div>
  // )
  // return (
  //   <div onClick={toggleExpand} className={styles.outerButton}>
  //     {/* <button onClick={toggleExpand}>See More+</button> */}
  //     <div>{phrase}</div>
  //   </div>
  // )
};


export default Suggestion;
