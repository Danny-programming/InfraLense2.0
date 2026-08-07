const dotenv = require("dotenv");
const path = require("path");
const axios = require("axios");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function listModelsRaw() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Checking API Key:", apiKey.substring(0, 5) + "...");

    try {
        const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        console.log("✅ Models found:");
        res.data.models.forEach(m => console.log(`- ${m.name}`));
    } catch (error) {
        console.error("❌ Failed to list models:", error.response?.data || error.message);
    }
}

listModelsRaw();
