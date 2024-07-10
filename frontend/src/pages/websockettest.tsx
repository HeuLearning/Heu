'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

const WebSocketComponent = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [debugLogs, setDebugLogs] = useState([]);
  const { user, error, isLoading } = useUser();

  const addDebugLog = (message) => {
    setDebugLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const connectWebSocket = useCallback(() => {
    if (isLoading) {
      addDebugLog('Still loading user data...');
      return;
    }
    if (!user) {
      addDebugLog('No user data available. Are you logged in?');
      return;
    }
    if (!user.accessToken) {
      addDebugLog('No access token available. Check Auth0 configuration.');
      return;
    }

    addDebugLog('Attempting to connect WebSocket...');
    // Update the WebSocket URL to include the /inperson path
    // const ws = new WebSocket('ws://localhost:8000/inperson/ws/chat/');
    console.log("trying to do this");
    const ws = new WebSocket('ws://localhost:8000/inperson/ws/chat/');
    console.log("did this work?");

    ws.onopen = () => {
      addDebugLog('WebSocket Connected');
      setConnectionStatus('Connected');
      // Send authentication message
      ws.send(JSON.stringify({ type: 'authentication', token: user.accessToken }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      addDebugLog(`Received message: ${JSON.stringify(data)}`);
      if (data.type === 'pong') {
        setConnectionStatus('Connected (Pong received)');
      } else {
        setMessages(prev => [...prev, data.message]);
      }
    };

    // ws.onerror = (error) => {
    //   console.log(error);
    //   addDebugLog(`WebSocket Error: ${error.message}`);
    //   setConnectionStatus('Error');
    // };

    ws.onerror = (error) => {
      addDebugLog(`WebSocket Error: ${JSON.stringify(error)}`);
      console.error('WebSocket Error:', error);
      setConnectionStatus('Error');
    };

    ws.onclose = (event) => {
      addDebugLog(`WebSocket Disconnected. Code: ${event.code}, Reason: ${event.reason}`);
      setConnectionStatus('Disconnected');
    };

    setSocket(ws);
  }, [user, isLoading]);


  useEffect(() => {
    try {
      const ws = new WebSocket('ws://localhost:8000/inperson/ws/chat/');
      ws.send(JSON.stringify({ type: 'chat_message', message: "test" }));
      console.log("here?")
      connectWebSocket();

    } catch (error) {
      console.log(error)
      return null 
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [connectWebSocket]);

  const sendMessage = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN && inputMessage) {
      socket.send(JSON.stringify({ type: 'chat_message', message: inputMessage }));
      setInputMessage('');
    }
  }, [socket, inputMessage]);

  const testConnection = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'ping' }));
      setConnectionStatus('Pinging server...');
    } else {
      setConnectionStatus('WebSocket not connected');
    }
  }, [socket]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>WebSocket Test</h2>
      <p>Connection Status: {connectionStatus}</p>
      <button onClick={testConnection}>Test Connection</button>
      <div>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      <div>
        <h3>Messages:</h3>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
    </div>
  );
};

export default WebSocketComponent;