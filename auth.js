require('dotenv').config();

// DEBUG: Checking exactly how it's written in your .env
console.log("Checking .env load...");
console.log("Email:", process.env.email); 
console.log("Client ID:", process.env.clientID);

const getAuth = async () => {
    // Check using the exact case from your .env
    if (!process.env.email || !process.env.clientID) {
        console.error("ERROR: Still not loading. Make sure your .env has no commas at the end!");
        return;
    }

    try {
        const response = await fetch('http://20.207.122.201/evaluation-service/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "email": process.env.email,
                "name": process.env.name,
                "rollNo": process.env.rollNo,
                "accessCode": process.env.accessCode,
                "clientID": process.env.clientID,
                "clientSecret": process.env.clientSecret
            })
        });

        const data = await response.json();
        console.log("Full Server Response:", data);

        if (data.access_token) {
            console.log("Success! Your Token:", data.access_token);
        } else {
            console.log("Uh oh, no token. Check the server response above.");
        }
    } catch (error) {
        console.error("Connection Error:", error);
    }
};

getAuth();