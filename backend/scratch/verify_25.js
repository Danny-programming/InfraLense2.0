const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function verifySpecific() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // We found gemini-2.5-flash in the list
    const name = "gemini-2.5-flash";
    
    try {
        console.log(`Testing ${name}...`);
        const model = genAI.getGenerativeModel({ model: name });
        const result = await model.generateContent("Analyze this test prompt.");
        console.log(`✅ ${name} works! Response: ${result.response.text()}`);
    } catch (error) {
        console.error(`❌ ${name} failed: ${error.message}`);
    }
}

verifySpecific();
