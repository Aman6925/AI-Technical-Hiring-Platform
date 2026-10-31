
const express = require("express");
const router = express.Router();

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

module.exports = router;
