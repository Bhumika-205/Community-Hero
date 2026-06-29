const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');

// Base routes
router.post('/', issueController.createIssue);
router.get('/', async (req, res) => {
    try {
        const Issue = require('../models/Issue');
        const issues = await Issue.find().sort({ createdAt: -1 });
        res.json(issues);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/analytics/summary', issueController.getAnalyticsSummary);
router.put('/:id/upvote', issueController.upvoteIssue);

module.exports = router;