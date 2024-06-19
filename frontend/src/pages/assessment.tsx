'use client'
import Head from "next/head";
import Header from "../../components/header"
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { useStartAssessment } from "./api/services/use-start-assessment";
import { useAssessmentQuestion } from "./api/services/use-assessment-question";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { NavBar } from "components/navigation/nav-bar";
import Link from "next/link";
import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect } from "react";
import { after, before } from "node:test";
import getAssessmentQuestion from "./api/data/get-assessment-question";
import type { AssessmentHistory } from "models/assessment-history";
import type { AssessmentQuestion } from "models/assessment-question";
import { useRef } from "react";

export default function Assessment() {
  // const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const { user, error, isLoading } = useUser();
  const [shouldGetAssessmentHistory, setShouldGetAssessmentHistory] = useState<boolean>(true);
  const [shouldGetQuestion, setShouldGetQuestion] = useState<boolean>(false);
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistory>();
  const [assessmentQuestion, setAssessmentQuestion] = useState<AssessmentQuestion>();
  const [choices, setChoices] = useState<Array<string>>(['']);
  const [answer, setAnswer] = useState<string>('');
  const isFirstRender = useRef<boolean>(true); // Ref to keep track of the first render


  //  JULIA START:
  // const assessmentHistory: AssessmentHistory  = {
  //   id: "123",
  //   num_attempts: 1,
  //   questions: ["1", "2"],
  //   scores: ["1, 0"],
  // }

  // const assessmentQuestion: AssessmentQuestion = {
  //   done: false,
  //   question: {
  //     text: "I went to the store",
  //     audio: null,
  //     image: null,
  //     json: {
  //       blank_id: "1",
  //       wordbank: ["ate", "sat", "cried"],
  //       answer: "went",
  //       instruction: "Fill in the blank from the choices below"
  //     }
  //   },
  //   format: "a"
  // }


  // const choices = assessmentQuestion.question.json.wordbank;

  // END 




  const submitAnswer = (answer: string): void  =>  {
    if (assessmentQuestion.question && answer === assessmentQuestion.question.json.answer) {
      setAnswer('correct');
    } else {
      setAnswer('wrong');
    }
    setShouldGetQuestion(true);
  }
  // code to start the assessment
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // Ensure the effect runs only once

      console.log("Fetching assessment data...");
      const fetchData = async () => {
        const options = {
          method: 'GET',
          headers: {
            "content-type": "application/json",
          },
        };
        try {
          const response = await fetch('http://localhost:3000/api/data/start-assessment', options);
          const data = await response.json() as AssessmentHistory;
          setAssessmentHistory(data);
          console.log("Data fetched:", data);
          // setAssessmentHistory(data); // Assuming the API returns assessment history
        } catch (error) {
          console.error("Error fetching assessment data:", error);
        }
      };

      void fetchData();
    }
  }, []);

  if (assessmentQuestion && assessmentQuestion.done) {
    return(
      <div>
        great job you finished
      </div>
    )
  }

  else if (assessmentHistory && assessmentHistory.num_attempts > 0 && !assessmentQuestion) {
    return (
      <>  
        <Head>
          <title>Heu</title>
        </Head>
        <main>
      <NavBar/>

          <div>
            Would you like to retake the assessment? {`You have already taken it ${assessmentHistory.num_attempts} time(s).`}
          </div>
          <button onClick={() => setShouldGetQuestion(true)}>Retake</button>
        </main>
      </>
    )
  } else if (assessmentQuestion) {
    const blank_id: number = parseInt(assessmentQuestion.question.json.blank_id);
    const textParts = assessmentQuestion.question.text.split(" ");
    const beforeBlank: string = textParts.slice(0, blank_id).join(" ");
    const afterBlank: string = textParts.slice(blank_id + 1).join(" ");
    return (
      <>
        <NavBar/>
        <div>
          {answer === "wrong" && <div>dumb</div>}
          {answer === "correct" && <div>smart</div>}
          <div>{assessmentQuestion.question.json.instruction}</div>
          <div>
            {beforeBlank}
          </div>
          <div>
            ___
          </div>
          <div>
          <div>
            {afterBlank}
          </div>
          {choices.map((a, i) => {
            return(
              <div key={i}>
                <button onClick={() => submitAnswer(a)}>{a}</button>
              </div>
            )

          })}
          </div>
          <button onClick={() => console.log(shouldGetQuestion)}>stuff</button>
        </div>
        <button onClick={() => setShouldGetQuestion(true)}>Submit Question</button>
      </>
    )
  }
  // This will just what people see on page load if they haven't taken this before
  return (
    <>
      <Head>
        <title>Heu</title>
      </Head>
      <main>
        <div>
        <NavBar/>
        another question
        <button onClick={() => setShouldGetQuestion(true)}>Start</button>
        <button onClick={() => console.log(assessmentHistory)}>see state</button>
        </div>
      </main>
    </>
  );
}


export const getServerSideProps = withPageAuthRequired();