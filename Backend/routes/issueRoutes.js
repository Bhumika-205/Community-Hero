// Backend/routes/issueRoutes.js
const express = require('express');
const router = express.Router();
const {
    createIssue,
    getIssues,
    getIssueById,
    voteIssue
} = require('../controllers/issueController');

// Routes mapping
router.post('/', createIssue);
router.get('/', getIssues);
router.get('/:id', getIssueById);
router.put('/:id/vote', voteIssue);

module.exports = router;