import React from "react";
import { PageButton } from "components/buttons/page-button";
import styles from "../componentscss/PageinationFooter.module.css"

// Declaring type of props - see "Typing Component Props" for more examples
type AppProps = {
  chunk: number;
  maxChunk: number;
  setChunk: (chunk: number) => void;
}; /* use `interface` if exporting so that consumers can extend */

// Easiest way to declare a Function Component; return type is inferred.
const PaginationFooter = ( props: AppProps) => {

  return (
    <div className={styles.buttonContainer}>
      {props.chunk - 1 >= 0 && <PageButton selected={false} onClick={() => props.setChunk(props.chunk - 1)} text='Back'></PageButton>}
      {props.chunk - 3 >= 0 && <PageButton selected={false} onClick={() => props.setChunk(props.chunk - 3)} text={`${props.chunk-2}`}></PageButton>}
      {props.chunk - 2 >= 0 && <PageButton selected={false} onClick={() => props.setChunk(props.chunk - 2)} text={`${props.chunk-1}`}></PageButton>}
      {props.chunk - 1 >= 0 && <PageButton selected={false} onClick={() => props.setChunk(props.chunk - 1)} text={`${props.chunk}`}></PageButton>}
      <PageButton selected={true} onClick={() => console.log()} text={`${props.chunk + 1}`}></PageButton>
      {props.chunk + 1 <= props.maxChunk && <PageButton selected={false} onClick={() => props.setChunk(props.chunk + 1)} text={`${props.chunk + 2}`}></PageButton>}
      {props.chunk + 2 <= props.maxChunk && <PageButton selected={false} onClick={() => props.setChunk(props.chunk + 2)} text={`${props.chunk + 3}`}></PageButton>}
      {props.chunk + 3 <= props.maxChunk && <PageButton selected={false} onClick={() => props.setChunk(props.chunk + 3)} text={`${props.chunk + 4}`}></PageButton>}
      {props.chunk + 1 <= props.maxChunk && <PageButton selected={false} onClick={() => props.setChunk(props.chunk + 1)} text='Next'></PageButton>}
    </div>
  );
};


export default PaginationFooter;
