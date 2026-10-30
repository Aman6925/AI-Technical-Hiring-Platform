const express = require("express");
const router = express.Router();

const {
    addQuestion
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

module.exports = router;