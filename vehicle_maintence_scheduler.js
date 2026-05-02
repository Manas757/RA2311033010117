require('dotenv').config();

async function scheduleVehicles() {
    console.log("Checking Token:", process.env.ACCESS_TOKEN ? "Token Loaded!" : "TOKEN MISSING!");

    // Replace the URL below with the actual Vehicle API endpoint from your instructions
    const API_URL = 'http://20.207.122.201/evaluation-service/vehicles'; 

    try {
        const response = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${process.env.ACCESS_TOKEN}` }
        });

        const data = await response.json();
        console.log("Raw Server Response:", data);

        // Access the vehicle array (handle cases where it's wrapped in an object)
        const vehicles = Array.isArray(data) ? data : (data.vehicles || data.data);
        
        if (!vehicles || !Array.isArray(vehicles)) {
            console.error("🛑 Error: Could not find vehicle data. Check the Raw Server Response.");
            return;
        }

        // The maximum time available for maintenance (e.g., 8 hours / 480 mins)
        // Check your instructions for the exact 'maxTime' value required!
        const maxTime = 480; 

        const result = solveKnapsack(vehicles, maxTime);

        console.log("\n=== Optimized Maintenance Schedule ===");
        console.log("Total Profit:", result.totalProfit);
        console.log("Vehicles to Service:", result.selectedVehicles);
        
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

// Logic for the Knapsack Optimization (Stage 0)
function solveKnapsack(vehicles, maxTime) {
    const n = vehicles.length;
    const dp = Array.from({ length: n + 1 }, () => Array(maxTime + 1).fill(0));

    // Fill DP table
    for (let i = 1; i <= n; i++) {
        const { MaintenanceTime, Profit } = vehicles[i - 1];
        for (let j = 0; j <= maxTime; j++) {
            if (MaintenanceTime <= j) {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i - 1][j - MaintenanceTime] + Profit);
            } else {
                dp[i][j] = dp[i - 1][j];
            }
        }
    }

    // Backtrack to find which vehicles were selected
    let res = dp[n][maxTime];
    let w = maxTime;
    const selectedVehicles = [];

    for (let i = n; i > 0 && res > 0; i--) {
        if (res !== dp[i - 1][w]) {
            selectedVehicles.push(vehicles[i - 1]);
            res -= vehicles[i - 1].Profit;
            w -= vehicles[i - 1].MaintenanceTime;
        }
    }

    return {
        totalProfit: dp[n][maxTime],
        selectedVehicles: selectedVehicles
    };
}

// CRITICAL: Actually call the function to run the code
scheduleVehicles();