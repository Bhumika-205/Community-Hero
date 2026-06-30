const Issue = require('../models/Issue');
const { GoogleGenAI } = require('@google/genai'); // Assuming standard SDK usage

// Controller to create issue + run AI analytics
exports.createIssue = async (req, res) => {
  try {
    const { title, description, imageUrl, latitude, longitude } = req.body;

    if (!title || !description || !latitude || !longitude) {
    return res.status(400).json({ message: "Required reporting fields are missing." });
}

    // 1. Initialize Gemini Model (Using Google AI Studio)
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `
      You are a smart civic infrastructure AI analyzer for a hyperlocal community app.
      Analyze the following community reported issue:
      Title: "${title}"
      Description: "${description}"

      Respond strictly in valid JSON format with the following keys. Do not include any markdown block formatting or triple backticks.
      {
        "severity": "Low" or "Medium" or "High" or "Critical",
        "priority": "Low" or "Medium" or "High",
        "category": "e.g., Road & Infrastructure, Sanitation, Public Utilities, Safety, Environmental",
        "suggestedAction": "A brief 1-sentence recommended action for municipal workers or community volunteers."
      }
    `;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    // Parse AI text safely
    let aiData = { severity: 'Medium', priority: 'Medium', category: 'General', suggestedAction: 'Awaiting inspection.' };
    try {
      const cleanJson = aiResponse.text.replace(/```json|```/g, "").trim();
      aiData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("Gemini JSON Parsing failed, falling back to defaults:", parseError);
    }

    // 2. Save complete, enriched data to MongoDB
    const newIssue = new Issue({
      title,
      description,
      imageUrl,
      latitude,
      longitude,
      severity: aiData.severity,
      priority: aiData.priority,
      category: aiData.category,
      suggestedAction: aiData.suggestedAction
    });

    await newIssue.save();
    res.status(201).json({ success: true, data: newIssue });

  } catch (error) {
    console.error("Error creating issue:", error);
    res.status(500).json({ message: "Server error during issue creation." });
  }
};

//2. up votes
exports.upvoteIssue = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    issue.upvotes += 1;

    if (issue.upvotes >= 5) {
      issue.status = "Verified";
    }

    if (issue.upvotes >= 5 && issue.priority !== "High") {
      issue.priority = "High";
    }

    await issue.save();

    res.status(200).json({
      success: true,
      upvotesCount: issue.upvotes,
      priority: issue.priority,
      status: issue.status
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error voting" });
  }
};

// 4.  Analytics Dashboard Summary
exports.getAnalyticsSummary = async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments();
    const criticalIssues = await Issue.countDocuments({ severity: 'Critical' });
    
    // Grouping by category for the frontend chart dashboard
    const categoryBreakdown = await Issue.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      totalIssues,
      criticalIssues,
      categoryBreakdown
    });
  } catch (err) {
    res.status(500).json({ message: "Error collecting dashboard analytics" });
  }
};