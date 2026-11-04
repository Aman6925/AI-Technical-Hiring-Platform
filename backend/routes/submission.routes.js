
const express = require("express");
const router = express.Router();

const {
    startAssessment,
    getAssessmentAttempt,
    saveAnswer,
    submitAssessment
} = require("../controllers/submission.controller");

const {
    protect,
    authorizeRoles
} = require("../middleware/auth.middleware");

// Start Assessment
router.post(
    "/:assessmentId/start",
    protect,
    authorizeRoles("candidate"),
    startAssessment
);

// Get Attempt Details and Remaining Time
router.get(
    "/:submissionId/attempt",
    protect,
    authorizeRoles("candidate"),
    getAssessmentAttempt
);

// Save Candidate Answer
router.patch(
    "/:submissionId/answer",
    protect,
    authorizeRoles("candidate"),
    saveAnswer
);

// Submit Assessment
router.post(
    "/:submissionId/submit",
    protect,
    authorizeRoles("candidate"),
    submitAssessment
);

module.exports = router;