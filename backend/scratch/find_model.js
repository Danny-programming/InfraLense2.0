const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Note: The Node SDK doesn't have a direct listModels method on the genAI object
    // but the error message suggested it. Let's try to fetch a generic one or check docs.
    // Actually, usually gemini-1.5-flash is the correct one.
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Model requested: gemini-1.5-flash");
    } catch(e) {}
}

async function testVarious() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const candidates = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    
    for (const name of candidates) {
        try {
            console.log(`Testing ${name}...`);
            const model = genAI.getGenerativeModel({ model: name });
            const result = await model.generateContent("Hi");
            console.log(`✅ ${name} works!`);
            return;
        } catch (e) {
            console.error(`❌ ${name} failed: ${e.message}`);
        }
    }
}

testVarious();
