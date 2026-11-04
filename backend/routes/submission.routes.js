
const express = require("express");
const router = express.Router();

const {
    startAssessment,
    submitAssessment
} = require("../controllers/submission.controller");

const {
    protect,
    authorizeRoles
} = require("../middleware/auth.middleware");

// Start Assessment - Candidate Only
router.post(
    "/:assessmentId/start",
    protect,
    authorizeRoles("candidate"),
    startAssessment
);

// Submit Assessment - Candidate Only
router.post(
    "/:submissionId/submit",
    protect,
    authorizeRoles("candidate"),
    submitAssessment
);

module.exports = router;
