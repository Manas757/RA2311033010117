require('dotenv').config();

/**
 * Reusable Logging Middleware
 * @param {"backend"|"frontend"} stack 
 * @param {"debug"|"info"|"warn"|"error"|"fatal"} level 
 * @param {"cache"|"controller"|"db"|"domain"|"handler"|"middleware"|"repository"|"route"|"service"} packageType 
 * @param {string} message 
 */
async function Log(stack, level, packageType, message) {
    try {
        const response = await fetch('http://20.207.122.201/evaluation-service/logs', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                stack: stack,
                level: level,
                package: packageType,
                message: message
            })
        });

        if (!response.ok) {
            console.error(`Log failed with status: ${response.status}`);
        }
    } catch (error) {
        console.error("Critical failure reaching logging server:", error);
    }
}

module.exports = { Log };