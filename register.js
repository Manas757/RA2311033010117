
const register = async () => {
    const response = await fetch('http://20.207.122.201/evaluation-service/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "email": "mk0479@srmist.edu.in", // Use university email
            "name": "Manas_Kashyap",
            "mobileNo": "9873851567",
            "githubUsername": "Manas757", // Match your submitted link
            "rollNo": "RA2311033010117",
            "accessCode": "QkbpxH" // Replace with the code from your email
        })
    });

    const data = await response.json();
    console.log("CRITICAL: Save these immediately!", data);
    // You will get back a clientID and clientSecret
};

register();