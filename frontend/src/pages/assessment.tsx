import Head from "next/head";
import Header from "../../components/header";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
// import { useStartAssessment } from "./api/services/use-start-assessment";
// import { useAssessmentQuestion } from "./api/services/use-assessment-question";
import { useState } from "react";
// import { useSession } from "next-auth/react";
import { NavBar } from "components/navigation/nav-bar";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect } from "react";
import { after, before } from "node:test";
// import getAssessmentQuestion from "./api/data/get-assessment-question";
import type { AssessmentHistory } from "models/assessment-history";
import type { AssessmentQuestion } from "models/assessment-question";

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

export default function Assessment() {
  // const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  // const { user, error, isLoading } = useUser();
  const [shouldGetAssessmentHistory, setShouldGetAssessmentHistory] =
    useState<boolean>(true);
  const [shouldGetQuestion, setShouldGetQuestion] = useState<boolean>(false);
  // const [choices, setChoices] = useState<Array<string>>(['']);
  const [answer, setAnswer] = useState<string>("");
  // const [wrongAnswer, setWrongAnswer] = useState<string>('no');
  const [selectedButton, setSelectedButton] = useState(null);

  const handleButtonClick = (buttonValue) => {
    setSelectedButton(buttonValue);
  };

  // JULIA START:
  const assessmentHistory: AssessmentHistory = {
    id: "123",
    num_attempts: 1,
    questions: ["1", "2"],
    scores: ["1, 0"],
  };

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      // Pick a random index
      const j = Math.floor(Math.random() * (i + 1));
      // Swap array[i] with the element at index j
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const assessmentQuestion: AssessmentQuestion = {
    done: false,
    question: {
      text: "I went to the store",
      audio: null,
      image: null,
      json: {
        blank_id: "1",
        wordbank: ["ate", "sat", "cried"],
        answer: "went",
        instruction: "Fill in the blank from the choices below:",
      },
    },
    format: "a",
  };

  const choices = assessmentQuestion.question.json.wordbank;
  choices.push(assessmentQuestion.question.json.answer);

  // END

  const submitAnswer = (answer: string): void => {
    if (
      assessmentQuestion.question &&
      answer === assessmentQuestion.question.json.answer
    ) {
      setAnswer("correct");
    } else {
      setAnswer("wrong");
    }
    setShouldGetQuestion(true);
  };

  // const { assessmentHistory } = useStartAssessment({
  // url: `/api/data/start-assessment`,
  // method: "GET",
  // headers: {
  // "content-type": "application/json",
  // }
  // });

  // const { assessmentQuestion } = useAssessmentQuestion(shouldGetQuestion ? {
  // url: `/api/data/get-assessment-question`,
  // method: "POST",
  // headers: {
  // "content-type": "application/json",
  // },
  // data: {
  // assessmentHistory,
  // answer,
  // }
  // } : null);
  // useEffect(() => {
  // if (assessmentQuestion) {
  // setShouldGetQuestion(false);
  // }
  // console.log(assessmentQuestion)
  // }, [assessmentQuestion]);

  // useEffect(() => {
  // if (assessmentQuestion && !assessmentQuestion.done) {
  // // const blank_id: number = parseInt(assessmentQuestion.question.json.blank_id);
  // // const textParts = assessmentQuestion.question.text.split(" ");
  // // const beforeBlank: string = textParts.slice(0, blank_id).join(" ");
  // // const afterBlank: string = textParts.slice(blank_id + 1).join(" ");
  // const possibleAnswers: Array<string> = assessmentQuestion.question.json.wordbank;
  // possibleAnswers.push(assessmentQuestion.question.json.answer);
  // setChoices([...new Set(possibleAnswers)]); // Ensure no duplicates
  // setShouldGetQuestion(false);
  // }
  // }, [assessmentQuestion]);

  // if user not logged in then fuck it
  // else just get their assessment history

  // if (!user) {
  // return (
  // <NavBar/>
  // )
  // }

  // assessment finished
  // assessmentQuestion && assessmentQuestion.done
  if (false) {
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
  // assessmentHistory &&
  //   assessmentHistory.num_attempts > 0 &&
  //   !assessmentQuestion
  // already taken assessment
  else if (false) {
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
                  Would you like to retake the assessment?<br></br>
                  <br></br>
                  {`You have already taken it ${assessmentHistory.num_attempts} time(s).`}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setShouldGetQuestion(true)}
                >
                  Retake
                </Button>
              </CardActions>
            </Card>
            <br></br>
          </ThemeProvider>
        </main>
      </>
    );
  }
  // new question
  // assessmentQuestion
  else if (true) {
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
              {/* {answer === "wrong" && <div>dumb</div>}
            {answer === "correct" && <div>smart</div>} */}
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
                          onClick={() => handleButtonClick(a)}
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
  // new user, hasn't taken assessment
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
                  onClick={() => setShouldGetQuestion(true)}
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

// export const getServerSideProps = withPageAuthRequired();
