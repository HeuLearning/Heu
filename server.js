
const { json } = require('stream/consumers');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let learners = []; // Array to keep track of learners
let student_data = {};
let wsConnections = new Map(); // Map to track WebSocket connections by ID

wss.on('connection', (ws) => {
    console.log('Client connected');

    // Generate a unique ID for this WebSocket connection
    const wsId = generateUniqueId();
    wsConnections.set(wsId, ws);

    // Send the updated list of learners to the new client
    ws.send(JSON.stringify({ type: 'UPDATE_LEARNERS', learners }));

    // Handle messages from clients
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log("Data from client:" + data);

            if (data.type === 'join') {
                const newLearner = data.learner;

                // Check if the learner is already in the list
                const existingLearnerIndex = learners.findIndex(learner => learner.id === newLearner.id);
                
                if (existingLearnerIndex === -1) {
                    // Add the learner to the list with the WebSocket ID
                    learners.push({ ...newLearner, wsId });
                    console.log(`Learner joined: ${newLearner.name}`);
                } else {
                    // Update the existing learner's status and WebSocket ID
                    learners[existingLearnerIndex] = { ...newLearner, wsId };
                    console.log(`Learner updated: ${newLearner.name}`);
                }

                // Log the updated list of learners
                console.log('Updated learners in session:');
                learners.forEach(learner => console.log(`- ${learner.name} (ID: ${learner.id})`));

                // Broadcast updated learners list to all clients
                broadcastLearners();
            }

            if (data.type === 'disconnect') {
                const learnerId = data.learnerId;

                // Remove the learner from the list
                learners = learners.filter(learner => learner.id !== learnerId);
                console.log(`Learner disconnected: ${learnerId}`);

                // Log the updated list of learners
                console.log('Updated learners in session after disconnection:');
                learners.forEach(learner => console.log(`- ${learner.name} (ID: ${learner.id})`));

                // Broadcast updated learners list to all clients
                broadcastLearners();
            }

            if (data.type === 'NEXT_MODULE') {
                console.log("Received NEXT_MODULE data:");
                console.log(data);


                student_data = data;

                // Broadcast the updated student data to all clients
                broadcastData();
            }

        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        const wsId = Array.from(wsConnections.entries()).find(([_, value]) => value === ws)?.[0];
        if (wsId) {
            wsConnections.delete(wsId);

            // Remove the learner associated with this WebSocket ID
            learners = learners.filter(learner => learner.wsId !== wsId);

            // Broadcast updated learners list to all clients
            broadcastLearners();
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});


// Function to generate a unique ID for WebSocket connections
function generateUniqueId() {
    return Math.random().toString(36).substring(2, 15);
}

// Function to broadcast the list of learners
function broadcastLearners() {
    const updateMessage = JSON.stringify({ type: 'UPDATE_LEARNERS', learners });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(updateMessage);
        }
    });
}


function broadcastData() {
    const relevantData = {
        moduleId: student_data.moduleId,
        moduleName: student_data.moduleName.name,
        elapsedTime: student_data.elapsedTime
    };

    const updateMessage = JSON.stringify({ type: 'UPDATE_DATA', student_data: relevantData });

    // Broadcast to all clients
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(updateMessage);
        }
    });
}
console.log('WebSocket server is listening on port 8080');
