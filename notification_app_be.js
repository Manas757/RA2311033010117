require('dotenv').config();

const WEIGHTS = {
    "Placement": 3,
    "Result": 2,
    "Event": 1
};

async function getPriorityInbox() {
    console.log("Checking Token:", process.env.ACCESS_TOKEN ? "Token Loaded!" : "TOKEN MISSING!");

    const response = await fetch('http://20.207.122.201/evaluation-service/notifications', {
        headers: { 'Authorization': `Bearer ${process.env.ACCESS_TOKEN}` }
    });
    
    const data = await response.json();
    
    // THIS is the important part: Let's see what the server actually sent back
    console.log("Raw Server Response:", data);

    // Safely figure out where the array is
    let notificationsArray = [];
    if (Array.isArray(data)) {
        notificationsArray = data;
    } else if (data && Array.isArray(data.notifications)) {
        notificationsArray = data.notifications;
    } else if (data && Array.isArray(data.data)) {
        notificationsArray = data.data;
    } else {
        console.error("Error: The server did not return an array. Check the Raw Server Response above.");
        return;
    }

    const sorted = notificationsArray.sort((a, b) => {
        if (WEIGHTS[a.Type] !== WEIGHTS[b.Type]) {
            return (WEIGHTS[b.Type] || 0) - (WEIGHTS[a.Type] || 0); 
        }
        return new Date(b.Timestamp) - new Date(a.Timestamp);
    });

    const top10 = sorted.slice(0, 10);
    console.log("\n=== Priority Inbox Top 10 ===");
    console.log(top10);
}

getPriorityInbox();