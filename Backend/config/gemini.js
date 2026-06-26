// Backend/config/gemini.js
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const analyzeIssueWithAI = async (title, description) => {
    try {
        // Configure the model to enforce JSON output natively
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.5-flash",
            generationConfig: { responseMimeType: "application/json" } // Force JSON
        });

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
        - "Low"
        - "Medium"
        - "High"

        Return a JSON object matching this schema:
        {
            "category": "category_name",
            "severity": "severity_level"
        }
        `;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text().trim();

        // Safety cleanup just in case markdown blocks are present
        if (responseText.startsWith("```")) {
            responseText = responseText.replace(/^```json|```$/g, "").trim();
        }

        const parsedData = JSON.parse(responseText);
        return parsedData;

    } catch (error) {
        console.error("Gemini API Error:", error);
        return { category: "Others", severity: "Low" };
    }
};

module.exports = { analyzeIssueWithAI };