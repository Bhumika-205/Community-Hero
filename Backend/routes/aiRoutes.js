const express = require("express");
const router = express.Router();
const { analyzeIssueWithAI } = require("../config/gemini");

router.post("/analyze", async (req, res) => {
    try {
        const {
            title,
            description,
            imageUrl,
        } = req.body;

        const analysis =
            await analyzeIssueWithAI(
                title,
                description,
                imageUrl
            );

        res.json(analysis);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

module.exports = router;