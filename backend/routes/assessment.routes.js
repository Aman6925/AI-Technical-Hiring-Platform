
const express = require("express");
const router = express.Router();

const {
    addQuestion,
    getAssessmentQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion
} = require("../controllers/question.controller");

const {
    createAssessment,
    getAllAssessments,
    getAssessmentById,
    updateAssessment,
    deleteAssessment
} = require("../controllers/assessment.controller");

const {
    protect,
    authorizeRoles
} = require("../middleware/auth.middleware");

// Create Assessment - Recruiter Only
router.post(
    "/",
    protect,
    authorizeRoles("recruiter"),
    createAssessment
);


// Get All Assessments
router.get(
    "/",
    protect,
    getAllAssessments
);

// Get Single Assessment
router.get(
    "/:id",
    protect,
    getAssessmentById
);

// Update Assessment - Recruiter Only
router.put(
    "/:id",
    protect,
    authorizeRoles("recruiter"),
    updateAssessment
);

// Delete Assessment - Recruiter Only
router.delete(
    "/:id",
    protect,
    authorizeRoles("recruiter"),
    deleteAssessment
);

// Add Question to Assessment - Recruiter Only
router.post(
    "/:assessmentId/questions",
    protect,
    authorizeRoles("recruiter"),
    addQuestion
);

// Get All Questions of an Assessment - Recruiter Only
router.get(
    "/:assessmentId/questions",
    protect,
    authorizeRoles("recruiter"),
    getAssessmentQuestions
);

// Get Single Question - Recruiter Only
router.get(
    "/:assessmentId/questions/:questionId",
    protect,
    authorizeRoles("recruiter"),
    getQuestionById
);

// Update Question - Recruiter Only
router.put(
    "/:assessmentId/questions/:questionId",
    protect,
    authorizeRoles("recruiter"),
    updateQuestion
);

// Delete Question - Recruiter Only
router.delete(
    "/:assessmentId/questions/:questionId",
    protect,
    authorizeRoles("recruiter"),
    deleteQuestion
);

module.exports = router;
