// import React, { useState, useEffect, useCallback } from 'react';
// import { useUser } from '@auth0/nextjs-auth0/client';
// import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
// import type { InferGetServerSidePropsType, GetServerSideProps } from "next";

// interface StudentProgress {
//   student_id: string;
//   question_id?: number;
//   answer?: string;
//   is_right?: boolean;
//   seconds_to_answer?: number;
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
//   const [roomName, setRoomName] = useState('');
//   const [isConnected, setIsConnected] = useState(false);
//   const [studentProgress, setStudentProgress] = useState<{ [key: string]: StudentProgress }>({});

//   const connectWebSocket = useCallback(() => {
//     if (!roomName) {
//       console.log('Room name is required');
//       return null;
//     }

//     const ws = new WebSocket(`ws://localhost:8000/ws/kahoot/${roomName}/?token=${sessionToken}`);  

//     ws.onopen = () => {
//       console.log('WebSocket Connected');
//       setIsConnected(true);
//       // Request initial progress when connection is established
//       ws.send(JSON.stringify({ type: 'get_initial_progress' }));
//     };

//     ws.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       console.log('Received message:', data);
      
//       switch (data.type) {
//         case 'student_progress':
//           setStudentProgress(prevProgress => ({
//             ...prevProgress,
//             [data.student_id]: {
//               student_id: data.student_id,
//               question_id: data.question_id,
//               answer: data.answer,
//               is_right: data.is_right,
//               seconds_to_answer: data.seconds_to_answer
//             }
//           }));
//           break;
//         case 'initial_progress':
//           setStudentProgress(data.progress);
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
//     if (roomName) {
//       const ws = connectWebSocket();
//       if (ws) {
//         setSocket(ws);
//       }
//     } else {
//       console.log('Room name is required');
//     }
//   };

//   const renderStudentProgress = () => {
//     return Object.values(studentProgress).map((progress) => (
//       <div key={progress.student_id}>
//         Student {progress.student_id}: 
//         {progress.question_id ? (
//           <>
//             Question {progress.question_id} - 
//             Answer: {progress.answer || 'N/A'}, 
//             Correct: {progress.is_right ? 'Yes' : 'No'}, 
//             Time: {progress.seconds_to_answer || 'N/A'}s
//           </>
//         ) : (
//           'Waiting for first answer'
//         )}
//       </div>
//     ));
//   };

//   return (
//     <div>
//       <h2>Kahoot Instructor View</h2>
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
//           <p>Connected to room: {roomName}</p>
//           <div>
//             <h3>Student Progress:</h3>
//             {renderStudentProgress()}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// import React, { useState, useEffect, useCallback } from 'react';
// import { useUser } from '@auth0/nextjs-auth0/client';
// import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
// import { GetServerSideProps } from 'next';

// interface StudentProgress {
//   student_id: string;
//   enrolled: boolean;
//   started: boolean;
//   question_id?: number;
//   answer?: string;
//   is_right?: boolean;
//   seconds_to_answer?: number;
// }

// interface KahootProps {
//   sessionToken: string;
// }

// export const getServerSideProps: GetServerSideProps<KahootProps> = withPageAuthRequired({
//   async getServerSideProps(ctx) {
//     const session = await getSession(ctx.req, ctx.res);

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
//         sessionToken: session.accessToken || ''
//       }
//     };
//   },
// });

// export default function InstructorKahoot({ sessionToken }: KahootProps) {
//   const { user, error, isLoading } = useUser();

//   const [socket, setSocket] = useState<WebSocket | null>(null);
//   const [roomName, setRoomName] = useState('');
//   const [isConnected, setIsConnected] = useState(false);
//   const [studentProgress, setStudentProgress] = useState<{ [key: string]: StudentProgress }>({});

//   const connectWebSocket = useCallback(() => {
//     if (!roomName) {
//       console.log('Room name is required');
//       return null;
//     }

//     const ws = new WebSocket(`ws://localhost:8000/ws/kahoot/${roomName}/?token=${sessionToken}`);  

//     ws.onopen = () => {
//       console.log('WebSocket Connected');
//       setIsConnected(true);
//       // Request initial progress when connection is established
//       ws.send(JSON.stringify({ type: 'get_initial_progress' }));
//     };

//     ws.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       console.log('Received message:', data);
      
//       switch (data.type) {
//         case 'student_progress':
//           setStudentProgress(prevProgress => ({
//             ...prevProgress,
//             [data.student_id]: {
//               student_id: data.student_id,
//               question_id: data.question_id,
//               answer: data.answer,
//               is_right: data.is_right,
//               seconds_to_answer: data.seconds_to_answer
//             }
//           }));
//           break;
//         case 'initial_progress':
//           setStudentProgress(data.progress);
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
//     if (roomName) {
//       const ws = connectWebSocket();
//       if (ws) {
//         setSocket(ws);
//       }
//     } else {
//       console.log('Room name is required');
//     }
//   };

//   const renderStudentProgress = () => {
//     return Object.entries(studentProgress).map(([id, progress]) => (
//       <div key={id}>
//         Student {progress.student_id}: 
//         {progress.enrolled ? (
//           progress.started ? (
//             progress.question_id ? (
//               <>
//                 Question {progress.question_id} - 
//                 Answer: {progress.answer || 'N/A'}, 
//                 Correct: {progress.is_right ? 'Yes' : 'No'}, 
//                 Time: {progress.seconds_to_answer || 'N/A'}s
//               </>
//             ) : (
//               'Started module, waiting for first answer'
//             )
//           ) : (
//             'Enrolled, not started'
//           )
//         ) : (
//           'Not enrolled'
//         )}
//       </div>
//     ));
//   };

//   const handleWebSocketMessage = (data: any) => {
//     switch (data.type) {
//       case 'student_progress':
//         setStudentProgress(prevProgress => ({
//           ...prevProgress,
//           [data.student_id]: {
//             ...prevProgress[data.student_id],
//             ...data,
//             enrolled: true,
//             started: true
//           }
//         }));
//         break;
//       case 'initial_progress':
//         setStudentProgress(data.progress);
//         break;
//       case 'student_joined':
//         setStudentProgress(prevProgress => ({
//           ...prevProgress,
//           [data.student_id]: {
//             ...prevProgress[data.student_id],
//             student_id: data.student_id,
//             enrolled: true,
//             started: false
//           }
//         }));
//         break;
//       case 'student_started_module':
//         setStudentProgress(prevProgress => ({
//           ...prevProgress,
//           [data.student_id]: {
//             ...prevProgress[data.student_id],
//             started: true
//           }
//         }));
//         break;
//       default:
//         console.log('Unhandled message type:', data.type);
//     }
//   };

//   useEffect(() => {
//     if (socket) {
//       socket.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//         console.log('Received message:', data);
//         handleWebSocketMessage(data);
//       };
//     }
//   }, [socket]);

//   return (
//     <div>
//       <h2>Kahoot Instructor View</h2>
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
//           <p>Connected to room: {roomName}</p>
//           <div>
//             <h3>Student Progress:</h3>
//             {renderStudentProgress()}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// import React, { useState, useEffect, useCallback } from 'react';
// import { useUser } from '@auth0/nextjs-auth0/client';
// import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
// import { GetServerSideProps } from 'next';

// interface StudentProgress {
//   student_id: string;
//   enrolled: boolean;
//   started: boolean;
//   completed: boolean;
//   question_id?: number;
//   answer?: string;
//   is_right?: boolean;
//   seconds_to_answer?: number;
// }

// interface KahootProps {
//   sessionToken: string;
// }

// export const getServerSideProps: GetServerSideProps<KahootProps> = withPageAuthRequired({
//   async getServerSideProps(ctx) {
//     const session = await getSession(ctx.req, ctx.res);

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
//         sessionToken: session.accessToken || ''
//       }
//     };
//   },
// });

// export default function InstructorKahoot({ sessionToken }: KahootProps) {
//   const { user, error, isLoading } = useUser();

//   const [socket, setSocket] = useState<WebSocket | null>(null);
//   const [roomName, setRoomName] = useState('');
//   const [isConnected, setIsConnected] = useState(false);
//   const [studentProgress, setStudentProgress] = useState<{ [key: string]: StudentProgress }>({});

//   const connectWebSocket = useCallback(() => {
//     if (!roomName) {
//       console.log('Room name is required');
//       return null;
//     }

//     const ws = new WebSocket(`ws://localhost:8000/ws/kahoot/${roomName}/?token=${sessionToken}`);  

//     ws.onopen = () => {
//       console.log('WebSocket Connected');
//       setIsConnected(true);
//       // Request initial progress when connection is established
//       ws.send(JSON.stringify({ type: 'get_initial_progress' }));
//     };

//     ws.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       console.log('Received message:', data);
//       handleWebSocketMessage(data);
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
//     if (roomName) {
//       const ws = connectWebSocket();
//       if (ws) {
//         setSocket(ws);
//       }
//     } else {
//       console.log('Room name is required');
//     }
//   };

//   const renderStudentProgress = () => {
//     return Object.entries(studentProgress).map(([id, progress]) => (
//       <div key={id}>
//         Student {progress.student_id}: 
//         {progress.enrolled ? (
//           progress.completed ? (
//             'Completed module'
//           ) : (
//             progress.started ? (
//               progress.question_id ? (
//                 <>
//                   Question {progress.question_id} - 
//                   Answer: {progress.answer || 'N/A'}, 
//                   Correct: {progress.is_right ? 'Yes' : 'No'}, 
//                   Time: {progress.seconds_to_answer || 'N/A'}s
//                 </>
//               ) : (
//                 'Started module, waiting for first answer'
//               )
//             ) : (
//               'Enrolled, not started'
//             )
//           )
//         ) : (
//           'Not enrolled'
//         )}
//       </div>
//     ));
//   };

//   const handleWebSocketMessage = (data: any) => {
//     switch (data.type) {
//       case 'student_progress':
//         setStudentProgress(prevProgress => ({
//           ...prevProgress,
//           [data.student_id]: {
//             ...prevProgress[data.student_id],
//             ...data,
//             enrolled: true,
//             started: true
//           }
//         }));
//         break;
//       case 'initial_progress':
//         setStudentProgress(data.progress);
//         break;
//       case 'student_joined':
//         setStudentProgress(prevProgress => ({
//           ...prevProgress,
//           [data.student_id]: {
//             ...prevProgress[data.student_id],
//             student_id: data.student_id,
//             enrolled: true,
//             started: false,
//             completed: false
//           }
//         }));
//         break;
//       case 'student_started_module':
//         setStudentProgress(prevProgress => ({
//           ...prevProgress,
//           [data.student_id]: {
//             ...prevProgress[data.student_id],
//             started: true
//           }
//         }));
//         break;
//       case 'student_completed_module':
//         setStudentProgress(prevProgress => ({
//           ...prevProgress,
//           [data.student_id]: {
//             ...prevProgress[data.student_id],
//             completed: true
//           }
//         }));
//         break;
//       default:
//         console.log('Unhandled message type:', data.type);
//     }
//   };

//   return (
//     <div>
//       <h2>Kahoot Instructor View</h2>
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
//           <p>Connected to room: {roomName}</p>
//           <div>
//             <h3>Student Progress:</h3>
//             {renderStudentProgress()}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }


import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { GetServerSideProps } from 'next';

interface StudentProgress {
  student_id: string;
  enrolled: boolean;
  started: boolean;
  completed: boolean;
  question_id?: number;
  answer?: string;
  is_right?: boolean;
  seconds_to_answer?: number;
  total_questions?: number;
  correct_answers?: number;
  total_time?: number;
}

interface KahootProps {
  sessionToken: string;
}

export const getServerSideProps: GetServerSideProps<KahootProps> = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const session = await getSession(ctx.req, ctx.res);

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
        sessionToken: session.accessToken || ''
      }
    };
  },
});

export default function InstructorKahoot({ sessionToken }: KahootProps) {
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
      handleWebSocketMessage(data);
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
    return Object.entries(studentProgress).map(([id, progress]) => (
      <div key={id}>
        <h4>Student {progress.student_id}</h4>
        {progress.enrolled ? (
          progress.completed ? (
            <>
              <p>Completed module</p>
              <p>Total questions: {progress.total_questions}</p>
              <p>Correct answers: {progress.correct_answers}</p>
              <p>Accuracy: {((progress.correct_answers || 0) / (progress.total_questions || 1) * 100).toFixed(2)}%</p>
              <p>Average response time: {((progress.total_time || 0) / (progress.total_questions || 1)).toFixed(2)} seconds</p>
            </>
          ) : (
            progress.started ? (
              progress.question_id ? (
                <>
                  <p>Question {progress.question_id}</p>
                  <p>Answer: {progress.answer || 'N/A'}</p>
                  <p>Correct: {progress.is_right ? 'Yes' : 'No'}</p>
                  <p>Time: {progress.seconds_to_answer || 'N/A'}s</p>
                </>
              ) : (
                <p>Started module, waiting for first answer</p>
              )
            ) : (
              <p>Enrolled, not started</p>
            )
          )
        ) : (
          <p>Not enrolled</p>
        )}
      </div>
    ));
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'student_progress':
        setStudentProgress(prevProgress => ({
          ...prevProgress,
          [data.student_id]: {
            ...prevProgress[data.student_id],
            ...data,
            enrolled: true,
            started: true,
            total_questions: (prevProgress[data.student_id]?.total_questions || 0) + 1,
            correct_answers: (prevProgress[data.student_id]?.correct_answers || 0) + (data.is_right ? 1 : 0),
            total_time: (prevProgress[data.student_id]?.total_time || 0) + (data.seconds_to_answer || 0)
          }
        }));
        break;
      case 'initial_progress':
        setStudentProgress(data.progress);
        break;
      case 'student_joined':
        setStudentProgress(prevProgress => ({
          ...prevProgress,
          [data.student_id]: {
            ...prevProgress[data.student_id],
            student_id: data.student_id,
            enrolled: true,
            started: false,
            completed: false,
            total_questions: 0,
            correct_answers: 0,
            total_time: 0
          }
        }));
        break;
      case 'student_started_module':
        setStudentProgress(prevProgress => ({
          ...prevProgress,
          [data.student_id]: {
            ...prevProgress[data.student_id],
            started: true
          }
        }));
        break;
      case 'student_completed_module':
        setStudentProgress(prevProgress => ({
          ...prevProgress,
          [data.student_id]: {
            ...prevProgress[data.student_id],
            completed: true
          }
        }));
        break;
      default:
        console.log('Unhandled message type:', data.type);
    }
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