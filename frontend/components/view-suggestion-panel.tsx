import React from "react";
import { type SuggestionModel } from "models/suggestion-model";
import Comments from "./suggestion-comments";
import { useState } from "react";
import { CustomButton } from "./buttons/custom-button";
import styles from "./ViewSuggestionPanel.module.css"

// Declaring type of props - see "Typing Component Props" for more examples
type AppProps = {
  suggestions: Array<SuggestionModel>;
  setSuggestions: (suggestions: Array<SuggestionModel>) => void;
}; 

// Easiest way to declare a Function Component; return type is inferred.
const ViewSuggestionPanel = ( props: AppProps) => {
  const [focusSuggestion, setFocusSuggestion] = useState<SuggestionModel | null>();

  if (focusSuggestion) {
    return (
      <Comments suggestion={focusSuggestion} setFocusSuggestion={setFocusSuggestion}></Comments>
    );
  }
  return (
    <div>
      <CustomButton onClick={() => props.setSuggestions([])} text='Back'></CustomButton>
      <div>{props.suggestions.map((s, i) => {
        return (
          <div key={i} className={styles.suggestionContainer}>
            <div>Original Text: {s.original_text}</div>
            <div>Submitted by: {s.submitter.email}</div>
            <div>{`Logion's Suggestion "${s.suggested_text}"`}</div>
            <div>Probability: {s.probability}</div>
            <CustomButton onClick={() => setFocusSuggestion(s)} text='View Comments'></CustomButton>
          </div>
        );
      })}
      </div>
    </div>
  );
};


export default ViewSuggestionPanel;
