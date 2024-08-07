// import React, { useState, useEffect, useCallback } from 'react';
// import { useUser } from '@auth0/nextjs-auth0/client';
// import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
// import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
// import { SettingsCellRounded } from '@mui/icons-material';

// interface ChatMessage {
//   username: string;
//   message: string;
// }

// interface Question {
//   id: string;
//   text: string;
//   number: number;
//   json: {}
// }

// export const getServerSideProps = withPageAuthRequired({
//   async getServerSideProps(ctx) {
//     const { req, res } = ctx;
//     const session = await getSession(req, res);

//     if (!session) {
//       return {
//         redirect: {
//           destination: "/api/auth/login",
//           permanent: false,
//         },
//       };
//     }

//     return {
//       props: {
//         sessionToken: session.accessToken
//       }
//     }
//   },
// });

// export default function Kahoot({
//   sessionToken,
// }: InferGetServerSidePropsType<typeof getServerSideProps>) {
//   const { user, error, isLoading } = useUser();

//   const [socket, setSocket] = useState<WebSocket | null>(null);
//   const [username, setUsername] = useState('');
//   const [roomName, setRoomName] = useState('');
//   const [message, setMessage] = useState('');
//   const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
//   const [isConnected, setIsConnected] = useState(false);
//   const [question, setQuestion] = useState<Question>(null);
//   const [isAnswered, setIsAnswered] = useState<Boolean>(false);
//   const [correct, setCorrect] = useState<Boolean>(false);
//   const [questionNumber, setQuestionNumber] = useState<number>(null);
//   const [answer, setAnswer] = useState<String>('');
//   const [startTime, setStartTime] = useState<number>(0);
//   const [time, setTime] = useState<number>(0);

//   const connectWebSocket = useCallback(() => {
//     if (!roomName) {
//       console.log('Room name is required');
//       return null;
//     }

//     const ws = new WebSocket(`ws://localhost:8000/ws/kahoot/${roomName}/?token=${sessionToken}`);  

//     ws.onopen = () => {
//       console.log('WebSocket Connected');
//       setIsConnected(true);
//     };

//     ws.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       console.log('Received message:', data);
      
//       switch (data.type) {
//         case 'student_progress':
//           // setStudentProgress(data);
//           console.log("wtv");
//         case 'chat':
//           setChatMessages(prevMessages => [...prevMessages, { username: data.username, message: data.message }]);
//           break;
//         case 'question':
//           setStartTime(Date.now());
//           setQuestion(data.question);
//           setIsAnswered(false);
//           setCorrect(false);
//           setQuestionNumber(data.question.number);
//           setAnswer('');
//           break;
//         case 'module_started':
//           console.log('Module started:', data.module_id);
//           // You can add additional state or actions for when a module starts
//           break;
//         default:
//           console.log('Unhandled message type:', data.type);
//       }
//     };

//     ws.onerror = (error) => {
//       console.error('WebSocket Error:', error);
//     };

//     ws.onclose = () => {
//       console.log('WebSocket Disconnected');
//       setIsConnected(false);
//     };

//     return ws;
//   }, [roomName, sessionToken]);

//   useEffect(() => {
//     let ws: WebSocket | null = null;

//     if (roomName) {
//       ws = connectWebSocket();
//       if (ws) {
//         setSocket(ws);
//       }
//     }

//     return () => {
//       if (ws) {
//         ws.close();
//       }
//     };
//   }, [roomName, connectWebSocket]);

//   const joinRoom = () => {
//     if (roomName && username) {
//       const ws = connectWebSocket();
//       if (ws) {
//         setSocket(ws);
//       }
//     } else {
//       console.log('Room name and username are required');
//     }
//   };

//   const sendMessage = () => {
//     if (socket && socket.readyState === WebSocket.OPEN && message) {
//       const messageData = {
//         type: 'chat',
//         username: username,
//         message: message
//       };
//       socket.send(JSON.stringify(messageData));
//       setMessage('');
//     } else {
//       console.log('Cannot send message. Check connection and make sure message is not empty.');
//     }
//   };

//   const startModule = () => {
//     console.log("trying to start a module");
//     if (socket && socket.readyState === WebSocket.OPEN) {
//       const messageData = {
//         type: 'start_module'
//       };
//       socket.send(JSON.stringify(messageData));
//     } else {
//       console.log('Cannot request next question. Check connection.');
//     }
//   }

//   const handleAnswer = (answer: String = "temp answer") => {
//     const time = Date.now() - startTime;
//     setTime(time);
//     setAnswer(answer);
//     setIsAnswered(true);
//     setCorrect(true); // will need to do some calculation here to find whether the answer is correct or not
//   }

//   const nextQuestion = () => {
//     if (socket && socket.readyState === WebSocket.OPEN) {
//       const messageData = {
//         type: 'next_question',
//         correct: correct,
//         number: questionNumber,
//         time: time,
//         question: question,
//         answer: answer,
//       };
//       console.log(JSON.stringify(messageData));
//       socket.send(JSON.stringify(messageData));
//     } else {
//       console.log('Cannot request next question. Check connection.');
//     }
//   };

//   return (
//     <div>
//       <h2>Kahoot</h2>
//       {!isConnected ? (
//         <div>
//           <input
//             type="text"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             placeholder="Enter your username"
//           />
//           <input
//             type="text"
//             value={roomName}
//             onChange={(e) => setRoomName(e.target.value)}
//             placeholder="Enter room name"
//           />
//           <button onClick={joinRoom}>Join Room</button>
//         </div>
//       ) : (
//         <>
//           <p>Connected to room: {roomName}</p>
//           <div>
//           </div>
//           {question && (
//             <div>
//               <h3>Current Question:</h3>
//               <p>{question.text}</p>
//               {isAnswered && (
//                 <button onClick={() => nextQuestion()}>Next Question</button>
//               )}
//               {!isAnswered && (
//                 <button onClick={() => handleAnswer()}>Answer</button>
//               )}
//             </div>
//           )}
//           {!question && (
//             <button onClick={() => startModule()}>start module</button>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";

interface Question {
  id: string;
  text: string;
  number: number;
  json: {}
}

interface IntermediateAnswer {
  answer: string;
  timeTaken: number;
}

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const { req, res } = ctx;
    const session = await getSession(req, res);

    if (!session) {
      return {
        redirect: {
          destination: "/api/auth/login",
          permanent: false,
        },
      };
    }

    return {
      props: {
        sessionToken: session.accessToken
      }
    }
  },
});

export default function StudentKahoot({
  sessionToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { user, error, isLoading } = useUser();

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [roomName, setRoomName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [correct, setCorrect] = useState<boolean>(false);
  const [questionNumber, setQuestionNumber] = useState<number | null>(null);
  const [finalAnswer, setFinalAnswer] = useState<string>('');
  const [intermediateAnswers, setIntermediateAnswers] = useState<IntermediateAnswer[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [lastAnswerTime, setLastAnswerTime] = useState<number>(0);
  const [moduleCompleted, setModuleCompleted] = useState<boolean>(false);

  const connectWebSocket = useCallback(() => {
    if (!roomName) {
      console.log('Room name is required');
      return null;
    }

    const ws = new WebSocket(`ws://localhost:8000/ws/kahoot/${roomName}/?token=${sessionToken}`);  

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received message:', data);
      
      switch (data.type) {
        case 'question':
          setStartTime(Date.now());
          setQuestion(data.question);
          setIsAnswered(false);
          setCorrect(false);
          setQuestionNumber(data.question.number);
          // setAnswer('');
          setModuleCompleted(false);
          break;
        case 'module_completed':
          setModuleCompleted(true);
          setQuestion(null);
          break;
        default:
          console.log('Unhandled message type:', data.type);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
      setIsConnected(false);
    };

    return ws;
  }, [roomName, sessionToken]);

  useEffect(() => {
    let ws: WebSocket | null = null;

    if (roomName) {
      ws = connectWebSocket();
      if (ws) {
        setSocket(ws);
      }
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [roomName, connectWebSocket]);

  const joinRoom = () => {
    if (roomName) {
      const ws = connectWebSocket();
      if (ws) {
        setSocket(ws);
      }
    } else {
      console.log('Room name is required');
    }
  };

  const startModule = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'start_module'
      };
      socket.send(JSON.stringify(messageData));
    } else {
      console.log('Cannot start module. Check connection.');
    }
  }

  const handleIntermediateAnswer = (answer: string) => {
    const currentTime = Date.now();
    const timeTaken = currentTime - (lastAnswerTime || startTime);
    
    setIntermediateAnswers(prev => [...prev, { answer, timeTaken }]);
    setLastAnswerTime(currentTime);
  }


  const handleFinalAnswer = (answer: string) => {
    const currentTime = Date.now();
    const timeTaken = currentTime - startTime;
    
    setFinalAnswer(answer);
    setIsAnswered(true);
    setCorrect(true); // This should be calculated based on the correct answer

    // Add the final answer to intermediate answers if it's different from the last intermediate answer
    if (intermediateAnswers.length === 0 || intermediateAnswers[intermediateAnswers.length - 1].answer !== answer) {
      setIntermediateAnswers(prev => [...prev, { answer, timeTaken: currentTime - lastAnswerTime }]);
    }
  }


  const nextQuestion = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'next_question',
        correct: correct,
        number: questionNumber,
        time: Date.now() - startTime,
        question: question,
        final_answer: finalAnswer,
        intermediate_answers: intermediateAnswers.map(ia => ia.answer),
        intermediate_timing: intermediateAnswers.map(ia => ia.timeTaken),
      };
      console.log(JSON.stringify(messageData));
      socket.send(JSON.stringify(messageData));

      // Reset intermediate answers and timing for the next question
      setIntermediateAnswers([]);
      setLastAnswerTime(0);
    } else {
      console.log('Cannot request next question. Check connection.');
    }
  };

  return (
    <div>
      <h2>Kahoot Student View</h2>
      {!isConnected ? (
        <div>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter room name"
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <>
          <p>Connected to room: {roomName}</p>
          {moduleCompleted ? (
            <div>
              <h3>All done!</h3>
              <p>You have completed all questions in this module.</p>
            </div>
          ) : question ? (
            <div>
              <h3>Current Question:</h3>
              <p>{question.text}</p>
              {isAnswered ? (
                <button onClick={nextQuestion}>Next Question</button>
              ) : (
                <>
                  <button onClick={() => handleIntermediateAnswer("A")}>A</button>
                  <button onClick={() => handleIntermediateAnswer("B")}>B</button>
                  <button onClick={() => handleIntermediateAnswer("C")}>C</button>
                  <button onClick={() => handleIntermediateAnswer("D")}>D</button>
                  <button onClick={() => handleFinalAnswer(intermediateAnswers[intermediateAnswers.length - 1]?.answer || "")}>Submit Answer</button>
                </>
              )}
            </div>
          ) : (
            <button onClick={startModule}>Start Module</button>
          )}
        </>
      )}
    </div>
  );
}