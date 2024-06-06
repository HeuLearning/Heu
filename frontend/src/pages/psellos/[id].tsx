import React from "react";
import { useText } from "../api/services/use-text";
import { useRouter } from 'next/router';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import Head from "next/head";
import Header from "components/header";
import styles from "../../styles/text.module.css"
import { useState } from "react";
import type { SuggestionModel } from "models/suggestion-model";
import Suggestion from "components/suggestion";
import ViewSuggestionPanel from "components/view-suggestion-panel";
import { type WordIndex } from "models/word-index";
import MaskableWord from "components/maskable-word";
import MakeSuggestionPanel from "components/make-suggestion-panel";
// import { getAccessToken } from "@auth0/nextjs-auth0";
import { type AxiosResponse, type AxiosRequestConfig } from "axios";
import axios from "axios";
import PaginationFooter from "components/navigation/pagination-footer";
import { type PotentialSuggestionModel } from "models/potential-suggestion-model";
import Search from "components/search";
import { type ScreensModel } from "models/screens-model";
import { CustomButton } from "../../../components/buttons/custom-button"
import { type WordProbabilityModel } from "models/WordProbabilityModel";

export default function SingleText() {
  const screens: ScreensModel = {
    generate: 'GENERATE_SUGGESTIONS',
    view: 'VIEW_SUGGESTIONS',
    search: 'SEARCH_TEXT',
  }
  const [screen, setScreen] = useState<string>(screens.generate);
  const [maskedWords, setMaskedWords] = useState<Array<WordIndex>>([]);
  const [maskedIndices, setMaskedIndices] = useState<Array<number>>([]);
  const [numTokens, setNumTokens] = useState<number>(1);
  const [suggestions, setSuggestions] = useState<Array<SuggestionModel>>([]);
  const [chunk, setChunk] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const id = router.query.id;
  const [potentialSuggestion, setPotentialSuggestion] = useState<PotentialSuggestionModel>();


 
  const getSuggestion = async ():Promise<PotentialSuggestionModel | void> => {
    if (maskedWords.length === 0) {
      window.alert("Must Select Words");
      return;
    }
    setLoading(true);
    // const { accessToken } = await getAccessToken(req, res);
    const config: AxiosRequestConfig = {
      url: `/api/data/get_suggestion`,
      method: "POST",
      headers: {
        "content-type": "application/json",
        // Authorization: `Bearer ${accessToken}`
      },
      data: {
        words: maskedWords,
        text_id: id,
        chunk: chunk,
        numTokens: numTokens
      }
    };
    const response: AxiosResponse<PotentialSuggestionModel> = await axios(config);
    const { data } = response;
    setPotentialSuggestion(data);
    // console.log(data)
    setLoading(false);
    return data;
    // useSuggestion({
    //   url: `/api/data/get_suggestion`,
    //   method: "GET",
    //   headers: {
    //     "content-type": "application/json",
    //   },
    //   // data: {
    //   //   id: router.query.id
    //   // }
    // });
  }


  const saveSuggestion = async (suggestion: WordProbabilityModel):Promise<string> => {
    const words = maskedWords.map(wordIndex =>  wordIndex.word);
    const start_index = maskedWords[0]?.index;
    const end_index = maskedWords[maskedWords.length - 1]?.index;

    const config: AxiosRequestConfig = {
      url: `/api/data/save_suggestion`,
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      data: {
        words: words,
        text_id: id,
        start_index: start_index,
        end_index: end_index,
        chunk: chunk,
        suggestion: suggestion
      }
    };
    const response: AxiosResponse<string> = await axios(config);
    const { data } = response;
    window.alert('Suggestion Saved');
    setMaskedWords([]);
    setMaskedIndices([]);
    setScreen(screens.view);
    // console.log(data)
    return data;
  }


  const maskWord = (word: string, index: number) => {
    // const tempMaskedWord: WordIndex = {
    //   index: props.index,
    //   word: props.word
    // }
    if (maskedWords.length === 0) {
      setMaskedWords([{word, index}]);
      setMaskedIndices([index]);
      return;
    }  
    const lastWord : WordIndex = maskedWords[maskedWords.length - 1];
    const firstWord : WordIndex = maskedWords[0];
    if (index === (lastWord.index + 1)) {
      const tempMaskedWords: Array<WordIndex> = maskedWords;
      tempMaskedWords.push({word, index});
      setMaskedWords([...tempMaskedWords]);
      setMaskedIndices([...maskedIndices, index]);
      return;
    }
    if (index === (firstWord.index - 1)) {
      const tempMaskedWords: Array<WordIndex> = maskedWords;
      tempMaskedWords.unshift({word, index});
      setMaskedWords([...tempMaskedWords]);
      setMaskedIndices([index, ...maskedIndices]);
      return;
    }
    window.alert("Words For Suggestion Be Kept Consecutive");
  } 


  const unMaskWord = (word: string, index: number) => {
    const lastWord : WordIndex = maskedWords[maskedWords.length - 1];
    const firstWord : WordIndex = maskedWords[0];
    if (maskedIndices.length === 1) {
      setMaskedIndices([]);
      setMaskedWords([]);
      setPotentialSuggestion(null);
    }
    if (lastWord.index === index) {
      const tempMaskedWords = maskedWords;
      tempMaskedWords.pop();
      setMaskedWords([...tempMaskedWords]);
      const tempMaskedIndices = maskedIndices;
      tempMaskedIndices.pop();
      setMaskedIndices(tempMaskedIndices);
      return;
    }
    if (firstWord.index === index) {
      const tempMaskedWords = maskedWords;
      tempMaskedWords.shift();
      setMaskedWords([...tempMaskedWords])
      const tempMaskedIndices = maskedIndices;
      tempMaskedIndices.shift();
      setMaskedIndices(tempMaskedIndices);
    } 
    window.alert("Words For Suggestion Be Kept Consecutive");
  }

  const { text } = useText({

    url: `/api/data/text`,
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    data: {
      id: router.query.id,
      chunk: chunk
    }
  });

  if (screen === screens.search) {
    return (
      <>
      <Head>Logion</Head>
      <Header/>
      <div className={styles.screenContainer}>
        <div className={styles.screenBackButtonContainer}>
          <CustomButton onClick={() => {setScreen(screens.view)}} text='Back'></CustomButton>
        </div>
        <Search text_id={id} setChunk={setChunk} setScreen={setScreen} screens={screens}></Search>
      </div>
      </>
    );
  }

  if (screen === screens.generate) {
    return (
      <>
        <Head>Logion</Head>
        <Header/>
        <div className={styles.textWithSuggestionsPanelContainer}>
          <div>
            {text && <div className={styles.workTitle}>{text[0].title}</div>}
            <div className={styles.buttonContainer}>
              <CustomButton text='View Already Made Suggestions' onClick={() => {
                setScreen(screens.view)
                setMaskedWords([])
              }}></CustomButton>
              <CustomButton text='Search' onClick={() => {setScreen(screens.search)}}></CustomButton>
            </div>
            {text &&  
            <>
              <PaginationFooter chunk={chunk} maxChunk={text[0].chunks} setChunk={setChunk}></PaginationFooter>
              <div className={styles.textContainer}>{text && text[0].body.trim().split(/[\s]+/).map((word, index) => {
                  return (
                    <div key={index} className={styles.wordDiv}>
                      <MaskableWord word={word} index={index} masked={maskedIndices.includes(index)} maskWord={maskWord} unMaskWord={unMaskWord}></MaskableWord>
                    </div>
                  );
              })}
              </div>
            </>
            }
          </div>
          {text && <MakeSuggestionPanel potentialSuggestion={potentialSuggestion} setNumTokens={setNumTokens} numTokens={numTokens} loading={loading} saveSuggestion={saveSuggestion} chunk={chunk} text_id={text[0].id} getSuggestion={getSuggestion} maskedWords={maskedWords} setMaskedWords={setMaskedWords} ></MakeSuggestionPanel>}
        </div>
    </>
    )
  }

  // if (suggestions.length > 0) {
    return (
    <>
        <Head>Logion</Head>
        <Header/>
        <div className={styles.textWithSuggestionsPanelContainer}>
          <div>
            {text && <div className={styles.workTitle}>{text[0].title}</div>}
            <div className={styles.buttonContainer}>
              <CustomButton onClick={() => {
                setScreen(screens.generate)
                setMaskedWords([])
                }} text='Ask Logion For Your Own Suggestion'></CustomButton>
                <CustomButton text='Search' onClick={() => {setScreen(screens.search)}}></CustomButton>
            </div>
            {text &&  
            <>
              <PaginationFooter chunk={chunk} maxChunk={text[0].chunks} setChunk={setChunk}></PaginationFooter>
              <div className={styles.textContainer}>{text && text[0].body.trim().split(/[\s]+/).map((word, index) => {
                  const suggestions : Array<SuggestionModel> = [];
                  text[1].forEach((suggestion: SuggestionModel )=> {
                    if (index <= suggestion.end_index && index >= suggestion.start_index) {
                      suggestions.push(suggestion)
                    }
                  })
                  if (suggestions.length > 0) return <Suggestion word={word} suggestions={suggestions} index={index} setSuggestions={setSuggestions}></Suggestion>
                  return <div className={styles.wordDiv} key={index}>{word.trim()}</div>;
              })}
              </div>
            </>
            }
          </div>
          {suggestions.length > 0 &&  <ViewSuggestionPanel suggestions={suggestions} setSuggestions={setSuggestions}></ViewSuggestionPanel>}
        </div>
    </>
    )
  // }

  return (
      <>
        <Head>Logion</Head>
        <Header/>
        <div className={styles.textWithSuggestionsPanelContainer}>
          {text && <div className={styles.workTitle}>{text[0].title}</div>}
          <div className={styles.buttonContainer}>
            <CustomButton onClick={() => {
              setScreen(screens.generate)
              setMaskedWords([])
              }} text='Ask Logion For Your Own Suggestion'></CustomButton>
              <CustomButton text='Search' onClick={() => {setScreen(screens.search)}}></CustomButton>
          </div>
          <div className={styles.textContainer}>{text && text[0].body.trim().split(/[\s]+/).map((word, index) => {
              const suggestions : Array<SuggestionModel> = [];
              text[1].forEach((suggestion: SuggestionModel )=> {
                if (index <= suggestion.end_index && index >= suggestion.start_index) {
                  suggestions.push(suggestion)
                }
              })
              if (suggestions.length > 0) return <Suggestion word={word} suggestions={suggestions} index={index} setSuggestions={setSuggestions}></Suggestion>
              return <div className={styles.wordDiv} key={index}>{word.trim()}</div>;
          })}
          </div>
        </div>
      </>
  );
}

export const getServerSideProps = withPageAuthRequired();