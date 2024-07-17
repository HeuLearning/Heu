// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { useUser } from '@auth0/nextjs-auth0/client';

// interface Question {
//   question: string;
//   options: string[];
// }

// interface Answer {
//   userId: string;
//   answer: string;
// }

// const KahootLikeComponent: React.FC = () => {
//   const { user, isLoading } = useUser();
//   const [socket, setSocket] = useState<WebSocket | null>(null);
//   const [roomName, setRoomName] = useState('');
//   const [isConnected, setIsConnected] = useState(false);
//   const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
//   const [answers, setAnswers] = useState<Answer[]>([]);
//   const [userRole, setUserRole] = useState<'instructor' | 'student' | null>(null);

//   const connectWebSocket = useCallback(() => {
//     if (!roomName || !user) {
//       console.log('Room name and user are required');
//       return null;
//     }

//     const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
//     const host = window.location.host;
//     const wsUrl = `${protocol}//${host}/ws/kahoot/${roomName}/?token=${encodeURIComponent(user.sub as string)}`;

//     const ws = new WebSocket(wsUrl);

//     ws.onopen = () => {
//       console.log('WebSocket Connected');
//       setIsConnected(true);
//     };

//     ws.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       switch (data.type) {
//         case 'authentication_result':
//           setUserRole(data.role);
//           break;
//         case 'question':
//           setCurrentQuestion(data);
//           setAnswers([]);  // Clear previous answers when new question arrives
//           break;
//         case 'student_answer':
//           if (userRole === 'instructor') {
//             setAnswers(prev => [...prev, { userId: data.user_id, answer: data.answer }]);
//           }
//           break;
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
//   }, [roomName, user]);

//   useEffect(() => {
//     if (isConnected) return;  // Don't reconnect if already connected
    
//     let ws: WebSocket | null = null;
//     if (roomName && user && !isLoading) {
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
//   }, [roomName, user, isLoading, connectWebSocket, isConnected]);

//   const joinRoom = () => {
//     console.log("joining room");
//     if (roomName && user) {
//       const ws = connectWebSocket();
//       if (ws) {
//         setSocket(ws);
//       }
//     } else {
//       console.log('Room name and user are required');
//     }
//   };
//   return (
//     <div>
//       <h2>Kahoot-like WebSocket Application</h2>
//       {!isConnected ? (
//         <div>
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
//           <p>Connected to room: {roomName} as {userRole}</p>
//           {userRole === 'instructor' ? (
//             <div>
//               <h3>Instructor Panel</h3>
//               <button onClick={() => sendQuestion("What is 2+2?", ["3", "4", "5", "6"])}>
//                 Send Sample Question
//               </button>
//               <h4>Student Answers:</h4>
//               <ul>
//                 {answers.map((answer, index) => (
//                   <li key={index}>{answer.userId}: {answer.answer}</li>
//                 ))}
//               </ul>
//             </div>
//           ) : (
//             <div>
//               <h3>Student Panel</h3>
//               {currentQuestion && (
//                 <div>
//                   <h4>{currentQuestion.question}</h4>
//                   {currentQuestion.options.map((option, index) => (
//                     <button key={index} onClick={() => sendAnswer(option)}>
//                       {option}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default KahootLikeComponent;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";

interface ChatMessage {
  username: string;
  message: string;
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
  const lastMessageRef = useRef<HTMLParagraphElement>(null);

  const connectWebSocket = useCallback(() => {
    if (!roomName) {
      console.log('Room name is required');
      return null;
    }
    // console.log("user: ", user);
    // const token = user['sub'];
    // console.log(token);
    const ws = new WebSocket(`ws://localhost:8000/ws/kahoot/${roomName}/?token=${sessionToken}`);  

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
    };

    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   if (data.type === 'history') {
    //     setChatMessages(data.messages);
    //   } else if (data.type === 'chat') {
    //     setChatMessages(prev => [...prev, { username: data.username, message: data.message }]);
    //   }
    // };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
      setIsConnected(false);
    };

    return ws;
  }, [roomName]);

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

  // const sendMessage = () => {
  //   if (socket && socket.readyState === WebSocket.OPEN && message && username) {
  //     socket.send(JSON.stringify({
  //       username: username,
  //       message: message
  //     }));
  //     setMessage('');
  //   } else {
  //     console.log('Cannot send message. Check connection and make sure username is set.');
  //   }
  // };

  // useEffect(() => {
  //   if (lastMessageRef.current) {
  //     lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }, [chatMessages]);

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
        </>
      )}
    </div>
  );
};
