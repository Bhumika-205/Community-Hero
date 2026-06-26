// Backend/controllers/issueController.js
const Issue = require('../models/Issue.js');

// Import the Gemini helper
const { analyzeIssueWithAI } = require('../config/gemini');

// @desc    Create a new issue report
// @route   POST /api/issues
const createIssue = async (req, res) => {
    try {
        const { title, description, latitude, longitude, address, imageUrl } = req.body;

        // Basic Validation
        if (!title || !description || !latitude || !longitude) {
        return res.status(400).json({ message: 'Please provide title, description, and location coordinates.' });
        }


        console.log("Analyzing issue with Gemini AI...");
        const aiAnalysis = await analyzeIssueWithAI(title, description);
        console.log("AI Analysis results:", aiAnalysis);


        const newIssue = new Issue({
        title,
        description,
        category: aiAnalysis.category, // Auto-assigned by AI
        severity: aiAnalysis.severity, // Auto-assigned by AI
        location: {
            latitude,
            longitude,
            address
        },
        imageUrl
    });

    const savedIssue = await newIssue.save();
    res.status(201).json(savedIssue);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all issues
// @route   GET /api/issues
const getIssues = async (req, res) => {
    try {
        // Fetch latest issues first
        const issues = await Issue.find().sort({ createdAt: -1 });
        res.status(200).json(issues);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get a single issue by ID
// @route   GET /api/issues/:id
const getIssueById = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) {
        return res.status(404).json({ message: 'Issue not found' });
        }
        res.status(200).json(issue);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Upvote or Verify an issue
// @route   PUT /api/issues/:id/vote
const voteIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) {
        return res.status(404).json({ message: 'Issue not found' });
    }

    // Increment upvote count
    issue.upvotes += 1;
    
    // Auto-update status to "Verified" if it reaches a threshold (e.g., 5 upvotes)
    if (issue.upvotes >= 5 && issue.status === 'Pending') {
        issue.status = 'Verified';
    }

    const updatedIssue = await issue.save();
    res.status(200).json(updatedIssue);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    createIssue,
    getIssues,
    getIssueById,
    voteIssue
};