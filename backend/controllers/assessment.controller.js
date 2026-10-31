const mongoose = require("mongoose");
const Assessment = require("../models/assessment.model");

// Create Assessment
const createAssessment = async (req, res) => {
    try {
        const {
            title,
            description,
            duration,
            totalMarks,
            passingMarks
        } = req.body;

        // Check required fields
        if (
            !title?.trim() ||
            !description?.trim() ||
            duration === undefined ||
            totalMarks === undefined ||
            passingMarks === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Validate numeric values
        const numericDuration = Number(duration);
        const numericTotalMarks = Number(totalMarks);
        const numericPassingMarks = Number(passingMarks);

        if (
            !Number.isInteger(numericDuration) ||
            !Number.isInteger(numericTotalMarks) ||
            !Number.isInteger(numericPassingMarks) ||
            numericDuration < 1 ||
            numericTotalMarks < 1 ||
            numericPassingMarks < 0 ||
            numericPassingMarks > numericTotalMarks
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid duration or marks"
            });
        }

        // Create assessment
        const assessment = await Assessment.create({
            title: title.trim(),
            description: description.trim(),
            duration: numericDuration,
            totalMarks: numericTotalMarks,
            passingMarks: numericPassingMarks,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: "Assessment created successfully!",
            assessment
        });

    } catch (error) {
        console.error("Create Assessment Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// Get All Assessments
const getAllAssessments = async (req, res) => {
    try {
        let filter = {};

        // Recruiter can see their own assessments
        if (req.user.role === "recruiter") {
            filter.createdBy = req.user._id;
        }

        // Candidate can see only published assessments
        else if (req.user.role === "candidate") {
            filter.status = "published";
        }

        // Admin can see all assessments
        else if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const assessments = await Assessment.find(filter)
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: assessments.length,
            assessments
        });

    } catch (error) {
        console.error("Get Assessments Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Get Single Assessment
const getAssessmentById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate Assessment ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid assessment ID"
            });
        }

        // Find Assessment
        const assessment = await Assessment.findById(id)
            .populate("createdBy", "name email");

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found"
            });
        }

        // Check access permissions
        if (
            req.user.role === "recruiter" &&
            assessment.createdBy._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You cannot access this assessment"
            });
        }

        if (
            req.user.role === "candidate" &&
            assessment.status !== "published"
        ) {
            return res.status(403).json({
                success: false,
                message: "This assessment is not available"
            });
        }

        res.status(200).json({
            success: true,
            assessment
        });

    } catch (error) {
        console.error("Get Assessment Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


const updateAssessment = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            title,
            description,
            duration,
            totalMarks,
            passingMarks,
            status
        } = req.body;

        // Validate Assessment ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid assessment ID"
            });
        }

        // Find assessment created by logged-in recruiter
        const assessment = await Assessment.findOne({
            _id: id,
            createdBy: req.user._id
        });

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found"
            });
        }

        // Validate text fields
        if (
            (title !== undefined &&
                (typeof title !== "string" || !title.trim())) ||
            (description !== undefined &&
                (typeof description !== "string" || !description.trim()))
        ) {
            return res.status(400).json({
                success: false,
                message: "Title and description cannot be empty"
            });
        }

        // Validate duration and marks
        const newDuration = duration === undefined
            ? assessment.duration
            : Number(duration);

        const newTotalMarks = totalMarks === undefined
            ? assessment.totalMarks
            : Number(totalMarks);

        const newPassingMarks = passingMarks === undefined
            ? assessment.passingMarks
            : Number(passingMarks);

        if (
            !Number.isInteger(newDuration) ||
            !Number.isInteger(newTotalMarks) ||
            !Number.isInteger(newPassingMarks) ||
            newDuration < 1 ||
            newTotalMarks < 1 ||
            newPassingMarks < 0 ||
            newPassingMarks > newTotalMarks
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid duration or marks"
            });
        }

        // Validate status
        if (
            status !== undefined &&
            !["draft", "published", "closed"].includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid assessment status"
            });
        }

        // Update allowed fields only
        if (title !== undefined) assessment.title = title.trim();
        if (description !== undefined) assessment.description = description.trim();

        assessment.duration = newDuration;
        assessment.totalMarks = newTotalMarks;
        assessment.passingMarks = newPassingMarks;

        if (status !== undefined) assessment.status = status;

        const updatedAssessment = await assessment.save();

        res.status(200).json({
            success: true,
            message: "Assessment updated successfully!",
            assessment: updatedAssessment
        });

    } catch (error) {
        console.error("Update Assessment Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


const deleteAssessment = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate Assessment ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid assessment ID"
            });
        }

        // Find and delete only recruiter's own assessment
        const assessment = await Assessment.findOneAndDelete({
            _id: id,
            createdBy: req.user._id
        });

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Assessment deleted successfully!"
        });

    } catch (error) {
        console.error("Delete Assessment Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};





module.exports = {
    createAssessment,
    getAllAssessments,
    getAssessmentById,
    updateAssessment,
    deleteAssessment
};
