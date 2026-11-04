
const express = require("express");
const router = express.Router();
const {
    addQuestion,
    addMultipleQuestions,
    getAssessmentQuestions,
    getCandidateQuestions,
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

// Add Multiple Questions - Recruiter Only
router.post(
    "/:assessmentId/questions/bulk",
    protect,
    authorizeRoles("recruiter"),
    addMultipleQuestions
);

// Get Questions Based on User Role
router.get(
    "/:assessmentId/questions",
    protect,
    (req, res, next) => {
        if (req.user.role === "candidate") {
            return getCandidateQuestions(req, res, next);
        }

        if (req.user.role === "recruiter") {
            return getAssessmentQuestions(req, res, next);
        }

        return res.status(403).json({
            success: false,
            message: "Access denied"
        });
    }
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
