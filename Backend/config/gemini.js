// Backend/config/gemini.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Gemini API client with the key from your .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyzes issue title and description to categorize and assess severity.
 * @param {string} title 
 * @param {string} description 
 * @returns {Promise<{category: string, severity: string}>}
 */
const analyzeIssueWithAI = async (title, description) => {
    try {
        // We use gemini-1.5-flash as it is optimized for fast text tasks
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Define a system prompt that forces Gemini to return strict JSON
        const prompt = `
        You are an AI assistant designed to help local governments classify community issues reported by citizens.
        
        Analyze the following community issue:
        Title: "${title}"
        Description: "${description}"
        
        Determine the correct category and severity level of the issue.
        
        Available Categories:
        - "Roads & Potholes"
        - "Electrical & Streetlights"
        - "Water & Sanitation"
        - "Waste Management"
        - "Public Facilities & Parks"
        - "Others"
        
        Available Severity Levels:
        - "Low" (e.g., minor graffiti, slight trash buildup)
        - "Medium" (e.g., broken park bench, flickering streetlight)
        - "High" (e.g., severe water main burst, large road pothole dangerous to cars, broken traffic signal)

        Return ONLY a raw JSON object with the following keys, without any markdown formatting or backticks:
        {
            "category": "category_name",
            "severity": "severity_level"
        }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        // Parse the JSON returned by Gemini
        const parsedData = JSON.parse(responseText);
        return parsedData;

    } catch (error) {
        console.error("Gemini API Error:", error);
        // Fallback values if the API fails or JSON parsing fails
        return { category: "Others", severity: "Low" };
    }
};

module.exports = { analyzeIssueWithAI };