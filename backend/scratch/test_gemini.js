const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function testGemini() {
    console.log("🚀 Starting Gemini API Health Check...");
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY is missing in .env");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        console.log("📡 Testing simple text generation...");
        const result = await model.generateContent("Hello, are you active?");
        console.log("✅ Text Result:", result.response.text());

        console.log("🎉 Gemini Service Connection: STABLE");
    } catch (error) {
        console.error("❌ Gemini API Test Failed:", error.message);
    }
}

testGemini();
