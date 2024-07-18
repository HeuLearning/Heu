import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { SettingsCellRounded } from '@mui/icons-material';

interface ChatMessage {
  username: string;
  message: string;
}

interface Question {
  text: string;
  number: number;
  json: {}
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

export default function Kahoot({
  sessionToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { user, error, isLoading } = useUser();

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('');
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [question, setQuestion] = useState<Question>(null);
  const [isAnswered, setIsAnswered] = useState<Boolean>(false);
  const [correct, setCorrect] = useState<Boolean>(false);
  const [questionNumber, setQuestionNumber] = useState<Number>(null);
  const [studentProgress, setStudentProgress] = useState<any>({});

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
        case 'student_progress':
          setStudentProgress(data);
          break
        case 'chat':
          setChatMessages(prevMessages => [...prevMessages, { username: data.username, message: data.message }]);
          break;
        case 'question':
          setQuestion(data.question);
          setIsAnswered(false);
          setCorrect(false);
          setQuestionNumber(data.question.number);
          break;
        case 'module_started':
          console.log('Module started:', data.module_id);
          // You can add additional state or actions for when a module starts
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
    if (roomName && username) {
      const ws = connectWebSocket();
      if (ws) {
        setSocket(ws);
      }
    } else {
      console.log('Room name and username are required');
    }
  };

  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN && message) {
      const messageData = {
        type: 'chat',
        username: username,
        message: message
      };
      socket.send(JSON.stringify(messageData));
      setMessage('');
    } else {
      console.log('Cannot send message. Check connection and make sure message is not empty.');
    }
  };

  const startModule = () => {
    console.log("trying to start a module");
    if (socket && socket.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'start_module'
      };
      socket.send(JSON.stringify(messageData));
    } else {
      console.log('Cannot request next question. Check connection.');
    }
  }

  const handleAnswer = () => {
    setIsAnswered(true);
    setCorrect(true); // will need to do some calculation here to find whether the answer is correct or not
  }

  const nextQuestion = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'next_question',
        correct: correct,
        number: questionNumber,
      };
      socket.send(JSON.stringify(messageData));
    } else {
      console.log('Cannot request next question. Check connection.');
    }
  };

  return (
    <div>
      <h2>Kahoot</h2>
      {!isConnected ? (
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
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
          {studentProgress && (
            <>
            <div>student: {studentProgress.student_id} is on question: {studentProgress.question_number}</div>
            </>
          )}
          {/* <div>
          </div>
          {question && (
            <div>
              <h3>Current Question:</h3>
              <p>{question.text}</p>
              {isAnswered && (
                <button onClick={() => nextQuestion()}>Next Question</button>
              )}
              {!isAnswered && (
                <button onClick={() => handleAnswer()}>Answer</button>
              )}
            </div>
          )}
          {!question && (
            <button onClick={() => startModule()}>start module</button>
          )} */}
        </>
      )}
    </div>
  );
}