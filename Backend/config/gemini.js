// Backend/config/gemini.js

require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

const analyzeIssueWithAI = async (
    title,
    description,
    imageUrl
) => {
    try {
        const model =
            genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                generationConfig: {
                    responseMimeType:
                        "application/json",
                },
            });

        const prompt = `
You are an expert civic issue analyzer.

Analyze the issue information.

Title:
${title || "Not provided"}

Description:
${description || "Not provided"}

Image URL:
${imageUrl || "Not provided"}

Return ONLY valid JSON.

{
  "title": "",
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

Generate:
- A short title
- A professional description
- Department responsible

Example:

{
  "title":"Overflowing Garbage Dump",
  "category":"Waste Management",
  "severity":"High",
  "priority":85,
  "department":"Municipal Waste Department",
  "description":"Large accumulation of garbage observed near a public area causing hygiene concerns."
}
`;

        const result =
            await model.generateContent(
                prompt
            );

        let responseText =
            result.response
                .text()
                .trim();

        if (
            responseText.startsWith(
                "```"
            )
        ) {
            responseText =
                responseText
                    .replace(
                        /^```json/,
                        ""
                    )
                    .replace(
                        /```$/,
                        ""
                    )
                    .trim();
        }

        const parsedData =
            JSON.parse(responseText);

        return {
            title:
                parsedData.title ||
                title ||
                "Community Issue",

            category:
                parsedData.category ||
                "Others",

            severity:
                parsedData.severity ||
                "Low",

            priority:
                parsedData.priority ||
                50,

            department:
                parsedData.department ||
                "Municipal Corporation",

            description:
                parsedData.description ||
                description ||
                "Issue reported by citizen.",
        };
    } catch (error) {
        console.error(
            "Gemini API Error:",
            error
        );

        return {
            title:
                title ||
                "Community Issue",

            category: "Others",

            severity: "Low",

            priority: 50,

            department:
                "Municipal Corporation",

            description:
                description ||
                "Issue reported by citizen.",
        };
    }
};

module.exports = { analyzeIssueWithAI };