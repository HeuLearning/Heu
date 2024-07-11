// // // import React from 'react';
// // // import BasicWebSocketComponent from '../components/BasicWebSocketComponent';
// // // import ErrorBoundary from '../components/ErrorBoundary';

// // // const WebSocketTestPage = () => {
// // //   return (
// // //     <div>
// // //       <h1>WebSocket Test Page</h1>
// // //       <ErrorBoundary fallback={<p>Something went wrong with the WebSocket component.</p>}>
// // //         <BasicWebSocketComponent />
// // //       </ErrorBoundary>
// // //     </div>
// // //   );
// // // };

// // // export default WebSocketTestPage;


// // import React, { useState, useEffect, useCallback } from 'react';

// // const MultiTabWebSocketComponent = () => {
// //   const [socket, setSocket] = useState(null);
// //   const [username, setUsername] = useState('');
// //   const [message, setMessage] = useState('');
// //   const [chatMessages, setChatMessages] = useState([]);
// //   const [isConnected, setIsConnected] = useState(false);

// //   const connectWebSocket = useCallback(() => {
// //     const ws = new WebSocket('ws://localhost:8000/inperson/ws/chat/');

// //     ws.onopen = () => {
// //       console.log('WebSocket Connected');
// //       setIsConnected(true);
// //     };

// //     ws.onmessage = (event) => {
// //       const data = JSON.parse(event.data);
// //       if (data.type === 'chat_message') {
// //         setChatMessages(prev => [...prev, { username: data.username, message: data.message }]);
// //       }
// //     };

// //     ws.onerror = (error) => {
// //       console.error('WebSocket Error:', error);
// //     };

// //     ws.onclose = () => {
// //       console.log('WebSocket Disconnected');
// //       setIsConnected(false);
// //     };

// //     setSocket(ws);

// //     return () => {
// //       ws.close();
// //     };
// //   }, []);

// //   useEffect(() => {
// //     connectWebSocket();
// //   }, [connectWebSocket]);

// //   const sendMessage = () => {
// //     if (socket && socket.readyState === WebSocket.OPEN && message && username) {
// //       socket.send(JSON.stringify({
// //         type: 'chat_message',
// //         username: username,
// //         message: message
// //       }));
// //       setMessage('');
// //     } else {
// //       console.log('Cannot send message. Check connection and make sure username is set.');
// //     }
// //   };

// //   return (
// //     <div>
// //       <h2>Multi-Tab WebSocket Chat</h2>
// //       {!isConnected && <p>Connecting to WebSocket...</p>}
// //       {isConnected && (
// //         <>
// //           <div>
// //             <input
// //               type="text"
// //               value={username}
// //               onChange={(e) => setUsername(e.target.value)}
// //               placeholder="Enter your username"
// //             />
// //           </div>
// //           <div>
// //             <input
// //               type="text"
// //               value={message}
// //               onChange={(e) => setMessage(e.target.value)}
// //               placeholder="Type a message"
// //             />
// //             <button onClick={sendMessage}>Send Message</button>
// //           </div>
// //           <div>
// //             <h3>Chat Messages:</h3>
// //             {chatMessages.map((msg, index) => (
// //               <p key={index}><strong>{msg.username}:</strong> {msg.message}</p>
// //             ))}
// //           </div>
// //         </>
// //       )}
// //     </div>
// //   );
// // };

// // export default MultiTabWebSocketComponent;



// import React, { useState, useEffect, useCallback } from 'react';

// const MultiRoomWebSocketComponent = () => {
//   const [socket, setSocket] = useState(null);
//   const [username, setUsername] = useState('');
//   const [roomName, setRoomName] = useState('');
//   const [message, setMessage] = useState('');
//   const [chatMessages, setChatMessages] = useState([]);
//   const [isConnected, setIsConnected] = useState(false);

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
//       setChatMessages(prev => [...prev, { username: data.username, message: data.message }]);
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

//   useEffect(() => {
//     if (roomName) {
//       connectWebSocket();
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

//   return (
//     <div>
//       <h2>Multi-Room WebSocket Chat</h2>
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
//           <div>
//             <h3>Chat Messages:</h3>
//             {chatMessages.map((msg, index) => (
//               <p key={index}><strong>{msg.username}:</strong> {msg.message}</p>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default MultiRoomWebSocketComponent;



import React, { useState, useEffect, useCallback, useRef } from 'react';

const ImprovedMultiRoomWebSocketComponent = () => {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('');
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const lastMessageRef = useRef(null);

  const connectWebSocket = useCallback(() => {
    if (!roomName) {
      console.log('Room name is required');
      return;
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

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [roomName]);

  useEffect(() => {
    if (roomName) {
      connectWebSocket();
    }
  }, [roomName, connectWebSocket]);

  const joinRoom = () => {
    if (roomName && username) {
      connectWebSocket();
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