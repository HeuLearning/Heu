import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";

interface StudentProgress {
  student_id: string;
  question_id?: number;
  answer?: string;
  is_right?: boolean;
  seconds_to_answer?: number;
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
  const [roomName, setRoomName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [studentProgress, setStudentProgress] = useState<{ [key: string]: StudentProgress }>({});

  const connectWebSocket = useCallback(() => {
    if (!roomName) {
      console.log('Room name is required');
      return null;
    }

    const ws = new WebSocket(`ws://localhost:8000/ws/kahoot/${roomName}/?token=${sessionToken}`);  

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
      // Request initial progress when connection is established
      ws.send(JSON.stringify({ type: 'get_initial_progress' }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received message:', data);
      
      switch (data.type) {
        case 'student_progress':
          setStudentProgress(prevProgress => ({
            ...prevProgress,
            [data.student_id]: {
              student_id: data.student_id,
              question_id: data.question_id,
              answer: data.answer,
              is_right: data.is_right,
              seconds_to_answer: data.seconds_to_answer
            }
          }));
          break;
        case 'initial_progress':
          setStudentProgress(data.progress);
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

  const renderStudentProgress = () => {
    return Object.values(studentProgress).map((progress) => (
      <div key={progress.student_id}>
        Student {progress.student_id}: 
        {progress.question_id ? (
          <>
            Question {progress.question_id} - 
            Answer: {progress.answer || 'N/A'}, 
            Correct: {progress.is_right ? 'Yes' : 'No'}, 
            Time: {progress.seconds_to_answer || 'N/A'}s
          </>
        ) : (
          'Waiting for first answer'
        )}
      </div>
    ));
  };

  return (
    <div>
      <h2>Kahoot Instructor View</h2>
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
          <div>
            <h3>Student Progress:</h3>
            {renderStudentProgress()}
          </div>
        </>
      )}
    </div>
  );
}