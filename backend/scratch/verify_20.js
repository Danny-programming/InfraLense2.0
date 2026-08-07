const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function verify20() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Testing 2.0-flash which was listed
    const name = "gemini-2.0-flash";
    
    try {
        console.log(`Testing ${name}...`);
        const model = genAI.getGenerativeModel({ model: name });
        const result = await model.generateContent("Analyze this test prompt.");
        console.log(`✅ ${name} works!`);
    } catch (error) {
        console.error(`❌ ${name} failed: ${error.message}`);
    }
}

verify20();
