import React from "react";
import { type WordIndex } from "models/word-index";
import styles from "./MakeSuggestion.module.css"
import { SyncLoader } from "react-spinners";
import { type PotentialSuggestionModel } from "models/potential-suggestion-model";
import { CustomButton } from "./buttons/custom-button";
import { PageButton } from "./buttons/page-button";
import type { WordProbabilityModel } from "models/WordProbabilityModel";

// Declaring type of props - see "Typing Component Props" for more examples
type AppProps = {
  maskedWords: Array<WordIndex>;
  getSuggestion: () => Promise<PotentialSuggestionModel>;
  saveSuggestion: (suggestion: WordProbabilityModel) => Promise<string>;
  loading: boolean;
  numTokens: number;
  setNumTokens: (tokens:number) => void;
  potentialSuggestion: PotentialSuggestionModel;
}; 

// Easiest way to declare a Function Component; return type is inferred.
const MakeSuggestionPanel = ( props: AppProps) => {

  const askForSuggestion = async() => {
    await props.getSuggestion();
  }

  if (props.loading) {
    return (
      <div>
        <div>
          <div>
            Masked Words: 
          </div>
          <div className={styles.maskedWordsContainer}>
            {props.maskedWords.map((wi, i) => {
              return (
                <div className={styles.wordDiv} key={i}>{wi.word}</div>
              )
            })}
          </div>
        </div>
        <div className={styles.thinking}>
        Logion is thinking!
          <SyncLoader></SyncLoader>
        </div>
      </div>
    );
  }
  
  if (props.maskedWords.length > 0 && props.potentialSuggestion && props.potentialSuggestion.suggestions.length === 0) {
    return(
      <div>
         <div>
            Masked Words: 
          </div>
          <div className={styles.maskedWordsContainer}>
            {props.potentialSuggestion.original_text}
          </div>
        <div>
          {'No Suggestions Within Levenshtein Distance 1'}
        </div>
      </div>
    );
  }

  if (props.maskedWords.length > 0 && props.potentialSuggestion) {
    return (
      <div>
        <div>
          {props.potentialSuggestion.original_text}
        </div>
        <div>{props.potentialSuggestion.suggestions.map((s, i) => {
          return (
            <div key={i}>
              <div>{s.word} {s.probability}</div>
              <button onClick={() => void props.saveSuggestion(s)}>Save Suggestion</button>
            </div>
          )
        })}
        </div>
    </div>
    );
  }

  if (props.maskedWords.length > 0) {
    return (
      <div>
        <div>
          <div>
              Masked Words: 
          </div>
          <div className={styles.maskedWordsContainer}>
              {props.maskedWords.map((wi, i) => {
                return (
                  <div className={styles.wordDiv} key={i}>{wi.word}</div>
                )
              })}
          </div>
        </div>
        <div>
          <div className={styles.tokenButtonContainer}>
            <PageButton selected={props.numTokens === 1} onClick={() => props.setNumTokens(1)} text='1 Token'></PageButton>
            <PageButton selected={props.numTokens === 2} onClick={() => props.setNumTokens(2)} text='2 Tokens'></PageButton>
            <PageButton selected={props.numTokens === 3} onClick={() => props.setNumTokens(3)} text='3 Tokens'></PageButton>
          </div>
          <CustomButton text='Ask For Suggestion' onClick={() => void askForSuggestion()}></CustomButton>
        </div>
       
      </div>
    );
  }

  return (
      <div>
            Masked Words: 
    </div>
  );
};


export default MakeSuggestionPanel;
