const express = require("express");
const router = express.Router();

const {
    addQuestion,
    getCandidateQuestions
} = require("../controllers/question.controller");

const {
    protect,
    authorizeRoles
} = require("../middleware/auth.middleware");

// Add Question - Recruiter Only
router.post(
    "/:assessmentId/questions",
    protect,
    authorizeRoles("recruiter"),
    addQuestion
);

// Get Questions - Candidate Only
router.get(
    "/:assessmentId/questions",
    protect,
    authorizeRoles("candidate"),
    getCandidateQuestions
);

module.exports = router;