import React, { useState, useEffect, useCallback } from 'react';

const BasicWebSocketComponent = () => {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket('ws://localhost:8000/inperson/ws/chat/');

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setConnectionStatus('Connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setReceivedMessages(prev => [...prev, data.message]);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setConnectionStatus('Error');
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
      setConnectionStatus('Disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(connectWebSocket, 5000);
    };

    setSocket(ws);
  }, []);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [connectWebSocket]);

  const sendMessage = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN && message) {
      socket.send(JSON.stringify({ type: 'chat_message', message }));
      setMessage('');
    } else {
      console.log('WebSocket not connected or message is empty');
    }
  }, [socket, message]);

  return (
    <div>
      <h2>Basic WebSocket Test</h2>
      <p>Connection Status: {connectionStatus}</p>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={sendMessage}>Send Message</button>
      </div>
      <div>
        <h3>Received Messages:</h3>
        {receivedMessages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
    </div>
  );
};

export default BasicWebSocketComponent;