import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

interface Question {
  question: string;
  options: string[];
}

interface Answer {
  userId: string;
  answer: string;
}

const KahootLikeComponent: React.FC = () => {
  const { user, isLoading } = useUser();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [roomName, setRoomName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [userRole, setUserRole] = useState<'instructor' | 'student' | null>(null);

  const connectWebSocket = useCallback(() => {
    if (!roomName || !user) {
      console.log('Room name and user are required');
      return null;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/kahoot/${roomName}/?token=${encodeURIComponent(user.sub as string)}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'authentication_result':
          setUserRole(data.role);
          break;
        case 'question':
          setCurrentQuestion(data);
          setAnswers([]);  // Clear previous answers when new question arrives
          break;
        case 'student_answer':
          if (userRole === 'instructor') {
            setAnswers(prev => [...prev, { userId: data.user_id, answer: data.answer }]);
          }
          break;
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
  }, [roomName, user]);

  useEffect(() => {
    if (isConnected) return;  // Don't reconnect if already connected
    
    let ws: WebSocket | null = null;
    if (roomName && user && !isLoading) {
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
  }, [roomName, user, isLoading, connectWebSocket, isConnected]);

  const joinRoom = () => {
    console.log("joining room");
    if (roomName && user) {
      const ws = connectWebSocket();
      if (ws) {
        setSocket(ws);
      }
    } else {
      console.log('Room name and user are required');
    }
  };

  const sendAnswer = (answer: string) => {
    if (socket && socket.readyState === WebSocket.OPEN && userRole === 'student') {
      socket.send(JSON.stringify({
        type: 'answer',
        answer: answer
      }));
    } else {
      console.log('Cannot send answer. Check connection and make sure you are a student.');
    }
  };

  const sendQuestion = (question: string, options: string[]) => {
    if (socket && socket.readyState === WebSocket.OPEN && userRole === 'instructor') {
      socket.send(JSON.stringify({
        type: 'question',
        question: question,
        options: options
      }));
    } else {
      console.log('Cannot send question. Check connection and make sure you are an instructor.');
    }
  };

  if (isLoading) return <div>Loading...</div>;

  if (!user) return <div>Please log in to use this application.</div>;

  return (
    <div>
      <h2>Kahoot-like WebSocket Application</h2>
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
          <p>Connected to room: {roomName} as {userRole}</p>
          {userRole === 'instructor' ? (
            <div>
              <h3>Instructor Panel</h3>
              <button onClick={() => sendQuestion("What is 2+2?", ["3", "4", "5", "6"])}>
                Send Sample Question
              </button>
              <h4>Student Answers:</h4>
              <ul>
                {answers.map((answer, index) => (
                  <li key={index}>{answer.userId}: {answer.answer}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div>
              <h3>Student Panel</h3>
              {currentQuestion && (
                <div>
                  <h4>{currentQuestion.question}</h4>
                  {currentQuestion.options.map((option, index) => (
                    <button key={index} onClick={() => sendAnswer(option)}>
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default KahootLikeComponent;