// Backend/config/gemini.js

require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeIssueWithAI = async (
    title,
    description,
    imageUrl
) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const prompt = `
You are an AI civic issue analyzer.

Analyze the following community issue.

Title:
${title}

Description:
${description}

Image URL:
${imageUrl || "No image provided"}

Return ONLY valid JSON.

{
  "category": "",
  "severity": "",
  "priority": 0,
  "department": "",
  "description": ""
}

Rules:

Category must be one of:
- Roads & Potholes
- Electrical & Streetlights
- Water & Sanitation
- Waste Management
- Public Facilities & Parks
- Others

Severity:
- Low
- Medium
- High

Priority:
- Integer from 1 to 100

Department examples:
- Road Maintenance Department
- Electricity Department
- Water Board
- Municipal Waste Department
- Parks & Recreation Department
- Municipal Corporation

Description:
Generate a short professional issue summary in 1-2 sentences.
`;

        const result = await model.generateContent(prompt);

        let responseText = result.response.text().trim();

        if (responseText.startsWith("```")) {
            responseText = responseText
                .replace(/^```json/, "")
                .replace(/```$/, "")
                .trim();
        }

        const parsedData = JSON.parse(responseText);

        return {
            category:
                parsedData.category || "Others",

            severity:
                parsedData.severity || "Low",

            priority:
                parsedData.priority || 50,

            department:
                parsedData.department ||
                "Municipal Corporation",

            description:
                parsedData.description ||
                description,
        };
    } catch (error) {
        console.error(
            "Gemini API Error:",
            error
        );

        return {
            category: "Others",
            severity: "Low",
            priority: 50,
            department: "Municipal Corporation",
            description,
        };
    }
};

module.exports = {
    analyzeIssueWithAI,
};