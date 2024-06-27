import Head from "next/head";
import Header from "../../components/header";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useStartAssessment } from "./api/services/use-start-assessment";
import { useAssessmentQuestion } from "./api/services/use-assessment-question";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { NavBar } from "components/navigation/nav-bar";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect } from "react";
import { after, before } from "node:test";
import getAssessmentQuestion from "./api/data/get-assessment-question";
import type { AssessmentHistory } from "models/assessment-history";
import type { AssessmentQuestion } from "models/assessment-question";
import { useRef } from "react";
import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";
import Alert from "@mui/material/Alert";
import CheckIcon from "@mui/icons-material/Check";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme.js";
import Button from "@mui/material/Button";
import CardActions from "@mui/material/CardActions";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Item from "@mui/material/Grid";

import styles from "./assessment.module.css";

import "@fontsource/inter";
// as opposed to the Assessment, this just automatically starts someone on the
// exam
export default function Diagnostic() {
  // const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const { user, error, isLoading } = useUser();
  const [shouldGetAssessmentHistory, setShouldGetAssessmentHistory] =
    useState<boolean>(true);
  const [shouldGetQuestion, setShouldGetQuestion] = useState<boolean>(false);
  const [assessmentHistory, setAssessmentHistory] =
    useState<AssessmentHistory>();
  const [assessmentQuestion, setAssessmentQuestion] =
    useState<AssessmentQuestion>();
  const [choices, setChoices] = useState<Array<string>>([""]);
  const [answer, setAnswer] = useState<string>("");
  const isFirstRender = useRef<boolean>(true); // Ref to keep track of the first render
  const [selectedButton, setSelectedButton] = useState<string>(null);

  const fisherYatesShuffle = (arr: Array<string>) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const getQuestion = (
    answer: string,
    assessmentHistory: AssessmentHistory,
    assessmentQuestion: AssessmentQuestion
  ): void => {
    console.log("Fetching assessment data...");
    const fetchData = async () => {
      try {
        const postOptions = {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            assessmentHistory,
            assessmentQuestion,
            answer,
          }),
        };
        console.log("well am I here?");
        const questionResponse = await fetch(
          "http://localhost:3000/api/data/get-assessment-question/",
          postOptions
        );
        const questionData =
          (await questionResponse.json()) as AssessmentQuestion;
        setAssessmentQuestion(questionData);
        let cs = [
          ...questionData.question.json.wordbank,
          questionData.question.json.answer,
        ];
        cs = fisherYatesShuffle(cs);
        setChoices(cs);
      } catch (error) {
        console.error("Error fetching assessment data:", error);
      }
    };
    void fetchData();
  };

  const startAssessment = (): void => {
    console.log("Fetching assessment data...");
    const fetchData = async () => {
      try {
        const getOptions = {
          method: "GET",
          headers: {
            "content-type": "application/json",
          },
        };
        const assessmentResponse = await fetch(
          "http://localhost:3000/api/data/start-assessment",
          getOptions
        );
        const assessmentData =
          (await assessmentResponse.json()) as AssessmentHistory;
        setAssessmentHistory(assessmentData);
        console.log("Data fetched:", assessmentData);
        const postOptions = {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            assessmentHistory: assessmentData,
            assessmentQuestion,
            answer,
          }),
        };
        console.log("well am I here?");
        getQuestion("", assessmentData as AssessmentHistory, null);
        // const questionResponse = await fetch('http://localhost:3000/api/data/get-assessment-question/', postOptions);
        // const questionData = await questionResponse.json() as AssessmentQuestion;
        // setAssessmentQuestion(questionData);
      } catch (error) {
        console.error("Error fetching assessment data:", error);
      }
    };

    void fetchData();
  };

  // const handleButtonClick = (buttonValue: string) => {
  //   setSelectedButton(buttonValue);
  // };

  const submitAnswer = (answer: string): void => {
    setSelectedButton(answer);
    let isRight = "wrong";
    if (
      assessmentQuestion.question &&
      answer === assessmentQuestion.question.json.answer
    ) {
      isRight = "correct";
    }
    getQuestion(isRight, assessmentHistory, assessmentQuestion);
  };
  // code to start the assessment
  // useEffect(() => {
  //   if (isFirstRender.current) {
  //     isFirstRender.current = false; // Ensure the effect runs only once

  //     console.log("Fetching assessment data...");
  //     const fetchData = async () => {
  //       const options = {
  //         method: 'GET',
  //         headers: {
  //           "content-type": "application/json",
  //         },
  //       };
  //       try {
  //         const response = await fetch('http://localhost:3000/api/data/start-assessment', options);
  //         const data = await response.json() as AssessmentHistory;
  //         setAssessmentHistory(data);
  //         console.log("Data fetched:", data);
  //         // setAssessmentHistory(data); // Assuming the API returns assessment history
  //       } catch (error) {
  //         console.error("Error fetching assessment data:", error);
  //       }
  //     };

  //     void fetchData();
  //   }
  // }, []);

  if (assessmentQuestion && assessmentQuestion.done) {
    return (
      <>
        <Head>
          <title>Heu Learning</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <main>
          <NavBar />
          <ThemeProvider theme={theme}>
            <Card sx={{ justifyContent: "center", p: 2 }}>
              <CardContent>
                <Typography align="center" variant="h6">
                  You're done!
                </Typography>
              </CardContent>
            </Card>
            <br></br>
          </ThemeProvider>
        </main>
      </>
    );
  }

  // else if (assessmentHistory && assessmentHistory.num_attempts > 0 && !assessmentQuestion) {
  //   return (
  //     <>
  //       <Head>
  //         <title>Heu</title>
  //       </Head>
  //       <main>
  //     <NavBar/>

  //         <div>
  //           Would you like to retake the assessment? {`You have already taken it ${assessmentHistory.num_attempts} time(s).`}
  //         </div>
  //         <button onClick={() => setShouldGetQuestion(true)}>Retake</button>
  //       </main>
  //     </>
  //   )
  else if (assessmentQuestion) {
    const blank_id: number = parseInt(
      assessmentQuestion.question.json.blank_id
    );
    const textParts = assessmentQuestion.question.text.split(" ");
    const beforeBlank: string = textParts.slice(0, blank_id).join(" ");
    const afterBlank: string = textParts.slice(blank_id + 1).join(" ");
    return (
      <>
        <NavBar />
        <ThemeProvider theme={theme}>
          <Card sx={{ justifyContent: "center", p: 2 }}>
            <CardContent>
              <Typography variant="h6">Question 1</Typography>
              <Typography align="center" variant="h6">
                {assessmentQuestion.question.json.instruction}
              </Typography>
              <br></br>
              <br></br>
              <Typography align="center" variant="h5">
                {beforeBlank} ___ {afterBlank}
              </Typography>
              <br></br>
              <div>
                <Grid
                  justifyContent="center"
                  container
                  spacing={1.5}
                  direction="row"
                >
                  {choices.map((a, i) => {
                    return (
                      <Grid item key={i}>
                        <Button
                          variant="outlined"
                          // onClick={() => submitAnswer(a)}
                          sx={{
                            bgcolor:
                              selectedButton === a ? "primary.main" : "null",
                            color:
                              selectedButton === a ? "white" : "primary.main",
                          }}
                          onClick={() => submitAnswer(a)}
                          size="large"
                          className={styles.answerButton}
                        >
                          {a}
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>
              </div>
              {/* <button onClick={() => console.log(shouldGetQuestion)}>
              stuff
            </button> */}
            </CardContent>
          </Card>
          <br></br>
          <Container sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShouldGetQuestion(true)}
            >
              Submit Question
            </Button>
          </Container>
        </ThemeProvider>
      </>
    );
  }
  // This will just what people see on page load if they haven't taken this before
  return (
    <>
      <Head>
        <title>Heu Learning</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <div>
          <NavBar />
          <ThemeProvider theme={theme}>
            <Card sx={{ justifyContent: "center", p: 2 }}>
              <CardContent>
                <Typography variant="h5" align="center">
                  Click to start the diagnostic assessment.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => startAssessment()}
                >
                  Start
                </Button>
              </CardActions>
            </Card>
          </ThemeProvider>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps = withPageAuthRequired();
