// Backend/controllers/issueController.js
const Issue = require('../models/Issue.js');
const { analyzeIssueWithAI } = require('../config/gemini');

// @desc    Create a new issue report
// @route   POST /api/issues
const createIssue = async (req, res) => {
    try {
        const {
            title,
            description,
            latitude,
            longitude,
            address,
            imageUrl,
            reportedBy
        } = req.body;

        if (!address) {
            return res.status(400).json({
                message: "Please provide an address."
            });
        }

        console.log("Analyzing issue with Gemini AI...");
        const aiAnalysis = await analyzeIssueWithAI(title, description, imageUrl);
        console.log('AI Analysis result:', aiAnalysis);

        const newIssue = new Issue({
            title: aiAnalysis.title || title || "Community Issue",

            description: aiAnalysis.description || description || "Issue reported by citizen.",

            category: aiAnalysis.category,

            severity: aiAnalysis.severity,

            priority: aiAnalysis.priority,

            department: aiAnalysis.department,

            location: { latitude: latitude || 0, longitude: longitude || 0, address },

            imageUrl,
            reportedBy: reportedBy || "Anonymous",
    });

        const savedIssue = await newIssue.save();
        res.status(201).json(savedIssue);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all issues (latest first)
// @route   GET /api/issues
const getIssues = async (req, res) => {
    try {
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
        if (!issue) return res.status(404).json({ message: 'Issue not found' });
        res.status(200).json(issue);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Upvote / verify an issue
// @route   PUT /api/issues/:id/vote
const voteIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ message: 'Issue not found' });

        issue.upvotes += 1;

        // Auto-promote to Verified at threshold
        if (issue.upvotes >= 5 && issue.status === 'Pending') {
            issue.status = 'Verified';
        }

        const updatedIssue = await issue.save();
        res.status(200).json(updatedIssue);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { createIssue, getIssues, getIssueById, voteIssue };