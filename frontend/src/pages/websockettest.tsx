//  // websockettest.tsx

// import React, { useState, useEffect, useCallback, useRef } from 'react';

// const ImprovedMultiRoomWebSocketComponent = () => {
//   const [socket, setSocket] = useState(null);
//   const [username, setUsername] = useState('');
//   const [roomName, setRoomName] = useState('');
//   const [message, setMessage] = useState('');
//   const [chatMessages, setChatMessages] = useState([]);
//   const [isConnected, setIsConnected] = useState(false);
//   const lastMessageRef = useRef(null);

//   const connectWebSocket = useCallback(() => {
//     if (!roomName) {
//       console.log('Room name is required');
//       return;
//     }

//     const ws = new WebSocket(`ws://localhost:8000/ws/chat/${roomName}/`);

//     ws.onopen = () => {
//       console.log('WebSocket Connected');
//       setIsConnected(true);
//     };

//     ws.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       if (data.type === 'history') {
//         setChatMessages(data.messages);
//       } else if (data.type === 'chat') {
//         setChatMessages(prev => [...prev, { username: data.username, message: data.message }]);
//       }
//     };

//     ws.onerror = (error) => {
//       console.error('WebSocket Error:', error);
//     };

//     ws.onclose = () => {
//       console.log('WebSocket Disconnected');
//       setIsConnected(false);
//     };

//     setSocket(ws);

//     return () => {
//       ws.close();
//     };
//   }, [roomName]);

//   // useEffect(() => {
//   //   if (roomName) {
//   //     connectWebSocket();
//   //   }
//   // }, [roomName, connectWebSocket]);

//   useEffect(() => {
//     if (roomName) {
//       const ws = connectWebSocket();
//       setSocket(ws);

//       return () => {
//         if (ws) {
//           ws.close();
//         }
//       };
//     }
//   }, [roomName, connectWebSocket]);


//   const joinRoom = () => {
//     if (roomName && username) {
//       connectWebSocket();
//     } else {
//       console.log('Room name and username are required');
//     }
//   };

//   const sendMessage = () => {
//     if (socket && socket.readyState === WebSocket.OPEN && message && username) {
//       socket.send(JSON.stringify({
//         username: username,
//         message: message
//       }));
//       setMessage('');
//     } else {
//       console.log('Cannot send message. Check connection and make sure username is set.');
//     }
//   };

//   useEffect(() => {
//     if (lastMessageRef.current) {
//       lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
//     }
//   }, [chatMessages]);

//   return (
//     <div>
//       <h2>Improved Multi-Room WebSocket Chat</h2>
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
//             <input
//               type="text"
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               placeholder="Type a message"
//             />
//             <button onClick={sendMessage}>Send Message</button>
//           </div>
//           <div style={{ height: '300px', overflowY: 'auto' }}>
//             <h3>Chat Messages:</h3>
//             {chatMessages.map((msg, index) => (
//               <p key={index} ref={index === chatMessages.length - 1 ? lastMessageRef : null}>
//                 <strong>{msg.username}:</strong> {msg.message}
//               </p>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default ImprovedMultiRoomWebSocketComponent;


import React, { useState, useEffect, useCallback, useRef } from 'react';

interface ChatMessage {
  username: string;
  message: string;
}

const ImprovedMultiRoomWebSocketComponent: React.FC = () => {
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

    const ws = new WebSocket(`ws://localhost:8000/ws/chat/${roomName}/`);

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'history') {
        setChatMessages(data.messages);
      } else if (data.type === 'chat') {
        setChatMessages(prev => [...prev, { username: data.username, message: data.message }]);
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

  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN && message && username) {
      socket.send(JSON.stringify({
        username: username,
        message: message
      }));
      setMessage('');
    } else {
      console.log('Cannot send message. Check connection and make sure username is set.');
    }
  };

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  return (
    <div>
      <h2>Improved Multi-Room WebSocket Chat</h2>
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
          <div>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
            />
            <button onClick={sendMessage}>Send Message</button>
          </div>
          <div style={{ height: '300px', overflowY: 'auto' }}>
            <h3>Chat Messages:</h3>
            {chatMessages.map((msg, index) => (
              <p key={index} ref={index === chatMessages.length - 1 ? lastMessageRef : null}>
                <strong>{msg.username}:</strong> {msg.message}
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImprovedMultiRoomWebSocketComponent;