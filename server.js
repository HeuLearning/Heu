require('dotenv').config(); // Load environment variables from .env file
const WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const wss = new WebSocket.Server({ port: 8080 });

let onlineUsers = new Map(); // Map to keep track of online users with username as key

wss.on('connection', (ws) => {
    console.log('Client connected');

    // Handle messages from clients
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'SET_USERNAME') {
                // Handle setting username
                if (data.username) {
                    onlineUsers.set(ws, data.username); // Associate WebSocket connection with username

                    // Send updated list of online users to all clients
                    const onlineUsersList = Array.from(onlineUsers.values());
                    const updateMessage = JSON.stringify({ type: 'UPDATE_ONLINE_USERS', onlineUsers: onlineUsersList });
                    wss.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(updateMessage);
                        }
                    });
                } else {
                    console.error('Invalid username data received:', data.username);
                }
            } else if (data.type === 'ADD_LEARNER') {
                // Handle adding learner (for demonstration)
                if (data.learner && data.learner.id && data.learner.name && data.learner.status) {
                    const { data: userData, error } = await supabase.auth.getUser();

                    if (error) {
                        console.error('Error fetching user from Supabase:', error);
                        return;
                    }

                    // Example static push for demonstration purposes
                    if (userData.user) {
                        console.log('User data:', userData.user);
                    }

                    // Handle broadcasting learners (static example)
                    const updatedLearnersMessage = JSON.stringify({ type: 'UPDATE_LEARNERS', learners: ["Example Learner"] });
                    wss.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(updatedLearnersMessage);
                        }
                    });
                } else {
                    console.error('Invalid learner data received:', data.learner);
                }
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        // Remove user from online users map
        onlineUsers.delete(ws);

        // Send updated list of online users to all clients
        const onlineUsersList = Array.from(onlineUsers.values());
        const updateMessage = JSON.stringify({ type: 'UPDATE_ONLINE_USERS', onlineUsers: onlineUsersList });
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(updateMessage);
            }
        });
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

console.log('WebSocket server is listening on port 8080');
