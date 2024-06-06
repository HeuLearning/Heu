import React, { useState } from "react";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "axios";
import { type SearchResult } from "models/search-result";
import { type ScreensModel } from "models/screens-model";
import styles from "./componentscss/Search.module.css"
import { CustomButton } from "./buttons/custom-button";

// Declaring type of props - see "Typing Component Props" for more examples
type AppProps = {
  text_id: string | string[];
  setChunk: (chunk: number) => void;
  setScreen: (screen: string) => void;
  screens: ScreensModel; 
  // suggestions: Array<SuggestionModel>;
  // setSuggestions: (suggestions: Array<SuggestionModel>) => void;
}; 

// Easiest way to declare a Function Component; return type is inferred.
const Search = ( props: AppProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<SearchResult>>();

  const updateQuery = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(event.target.value)
  }


  const search = async (): Promise<void> => {
    if (query === '') {
      window.alert("Please Enter Some Text");
      return;
    }
    const config: AxiosRequestConfig = {
      url: `/api/data/search`,
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      data: {
        query: query,
        text_id: props.text_id
      }
    };
    const result: AxiosResponse<Array<SearchResult>> = await axios(config);
    const { data } = result;
    console.log(result)
    setQuery('');
    setResults(data);
  }

  const selectSectionOfText = (chunk: number) => {
    setQuery('');
    props.setChunk(chunk);
    props.setScreen(props.screens.generate);

  }

  if (results && results.length === 0) {
    return (
      <div className={styles.searchContainer}>
        <div className={styles.noResultsResponse}>
          {'Your query returned no results. Please try something else. Note that especially long queries (over a paragraph) are less likely to return results.'}
        </div>
        <CustomButton onClick={() => setResults(null)} text='Search Something Else'></CustomButton>
      </div>

    );
  }


  if (results) {
    return (
      <div>
        <CustomButton onClick={() => setResults(null)} text='Search Something Else'></CustomButton>
        {results.map((r, i) => {
          return (
            <div key={i} className={styles.resultContainer}>
              <div>Result {r.offset+1}:</div>
              <div className={styles.resultText}>{`"${r.body}"`}</div>
              <CustomButton onClick={() => selectSectionOfText(r.offset)} text='Use This Section'></CustomButton>
            </div>

          );
        })}
      </div>

    );
  }

  return (
    <div className={styles.searchContainer}>
        <textarea className={styles.searchTextArea} value={query} placeholder="Put In Text Here" onChange={updateQuery}></textarea>
        <CustomButton onClick={() => {
          void search()
        }} text="Search"></CustomButton>
    </div>
  )
};


export default Search;
