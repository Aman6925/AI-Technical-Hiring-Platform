const Question = require("../models/question.model");
const Assessment = require("../models/assessment.model");
const mongoose = require("mongoose");

// Add Question to Assessment
const addQuestion = async (req, res) => {
    try {
        const { assessmentId } = req.params;

        const {
            questionText,
            questionType,
            options,
            correctAnswer,
            marks,
            difficulty,
            explanation
        } = req.body;

        // Validate Assessment ID
        if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid assessment ID"
            });
        }

        // Check required fields
        if (
            !questionText?.trim() ||
            !questionType ||
            marks === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Question text, question type and marks are required"
            });
        }

        // Validate question type
        if (!["mcq", "coding"].includes(questionType)) {
            return res.status(400).json({
                success: false,
                message: "Question type must be mcq or coding"
            });
        }

        // Validate marks
        if (!Number.isInteger(marks) || marks < 1) {
            return res.status(400).json({
                success: false,
                message: "Marks must be a positive integer"
            });
        }

        // Check Assessment Ownership
        const assessment = await Assessment.findOne({
            _id: assessmentId,
            createdBy: req.user._id
        });

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found or access denied"
            });
        }

        // MCQ Validation
        if (questionType === "mcq") {
            if (
                !Array.isArray(options) ||
                options.length < 2 ||
                options.some(option => typeof option !== "string" || !option.trim()) ||
                typeof correctAnswer !== "string" ||
                !correctAnswer.trim() ||
                !options.includes(correctAnswer.trim())
            ) {
                return res.status(400).json({
                    success: false,
                    message: "MCQ requires at least 2 valid options and a correct answer matching one option"
                });
            }
        }

        // Create Question
        const question = await Question.create({
            assessment: assessmentId,
            questionText: questionText.trim(),
            questionType,
            options: questionType === "mcq" ? options : [],
            correctAnswer: questionType === "mcq" ? correctAnswer.trim() : null,
            marks,
            difficulty,
            explanation
        });

        res.status(201).json({
            success: true,
            message: "Question added successfully!",
            question
        });

    } catch (error) {
        console.error("Add Question Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// Add Multiple Questions to Assessment (Bulk Upload)
const addMultipleQuestions = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const { questions } = req.body;

        // Validate Assessment ID
        if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid assessment ID"
            });
        }

        // Validate questions array
        if (
            !Array.isArray(questions) ||
            questions.length === 0 ||
            questions.length > 50
        ) {
            return res.status(400).json({
                success: false,
                message: "Provide between 1 and 50 questions"
            });
        }

        // Check Assessment Ownership
        const assessment = await Assessment.findOne({
            _id: assessmentId,
            createdBy: req.user._id
        });

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found or access denied"
            });
        }

        // Validate every question before inserting
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];

            if (
                !q.questionText ||
                typeof q.questionText !== "string" ||
                !q.questionText.trim() ||
                !["mcq", "coding"].includes(q.questionType) ||
                !Number.isInteger(q.marks) ||
                q.marks < 1
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid data in question ${i + 1}`
                });
            }

            if (
                q.difficulty !== undefined &&
                !["easy", "medium", "hard"].includes(q.difficulty)
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid difficulty in question ${i + 1}`
                });
            }

            if (q.questionType === "mcq") {
                if (
                    !Array.isArray(q.options) ||
                    q.options.length < 2 ||
                    q.options.some(
                        option =>
                            typeof option !== "string" ||
                            !option.trim()
                    ) ||
                    typeof q.correctAnswer !== "string" ||
                    !q.correctAnswer.trim() ||
                    !q.options.some(
                        option => option.trim() === q.correctAnswer.trim()
                    )
                ) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid MCQ options or answer in question ${i + 1}`
                    });
                }
            }
        }

        // Prepare questions for database
        const questionDocuments = questions.map(q => ({
            assessment: assessmentId,
            questionText: q.questionText.trim(),
            questionType: q.questionType,
            options: q.questionType === "mcq" ? q.options : [],
            correctAnswer:
                q.questionType === "mcq" ? q.correctAnswer.trim() : null,
            marks: q.marks,
            difficulty: q.difficulty || "medium",
            explanation: q.explanation || ""
        }));

        // Insert all questions together
        const savedQuestions = await Question.insertMany(
            questionDocuments
        );

        return res.status(201).json({
            success: true,
            message: "Questions added successfully",
            count: savedQuestions.length,
            questions: savedQuestions
        });

    } catch (error) {
        console.error("Bulk Add Questions Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// Get All Questions of an Assessment
const getAssessmentQuestions = async (req, res) => {
    try {
        const { assessmentId } = req.params;

        // Validate Assessment ID
        if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid assessment ID"
            });
        }

        // Check Assessment Ownership
        const assessment = await Assessment.findOne({
            _id: assessmentId,
            createdBy: req.user._id
        });

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found or access denied"
            });
        }

        // Fetch Questions
        const questions = await Question.find({
            assessment: assessmentId
        }).sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            count: questions.length,
            questions
        });

    } catch (error) {
        console.error("Get Questions Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Get Single Question
const getQuestionById = async (req, res) => {
    try {
        const { assessmentId, questionId } = req.params;

        // Validate IDs
        if (
            !mongoose.Types.ObjectId.isValid(assessmentId) ||
            !mongoose.Types.ObjectId.isValid(questionId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid assessment or question ID"
            });
        }

        // Check Assessment Ownership
        const assessment = await Assessment.findOne({
            _id: assessmentId,
            createdBy: req.user._id
        });

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found or access denied"
            });
        }

        // Find Question inside the Assessment
        const question = await Question.findOne({
            _id: questionId,
            assessment: assessmentId
        });

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        res.status(200).json({
            success: true,
            question
        });

    } catch (error) {
        console.error("Get Single Question Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Update Question
const updateQuestion = async (req, res) => {
    try {
        const { assessmentId, questionId } = req.params;

        const {
            questionText,
            questionType,
            options,
            correctAnswer,
            marks,
            difficulty,
            explanation
        } = req.body;

        // Validate IDs
        if (
            !mongoose.Types.ObjectId.isValid(assessmentId) ||
            !mongoose.Types.ObjectId.isValid(questionId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid assessment or question ID"
            });
        }

        // Check Assessment Ownership
        const assessment = await Assessment.findOne({
            _id: assessmentId,
            createdBy: req.user._id
        });

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found or access denied"
            });
        }

        // Find Question
        const question = await Question.findOne({
            _id: questionId,
            assessment: assessmentId
        });

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        // Validate Question Text
        if (questionText !== undefined) {
            if (typeof questionText !== "string" || !questionText.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Question text cannot be empty"
                });
            }

            question.questionText = questionText.trim();
        }

        // Validate Question Type
        if (questionType !== undefined) {
            if (!["mcq", "coding"].includes(questionType)) {
                return res.status(400).json({
                    success: false,
                    message: "Question type must be mcq or coding"
                });
            }

            question.questionType = questionType;
        }

        // Update Options
        if (options !== undefined) {
            question.options = options;
        }

        // Update Correct Answer
        if (correctAnswer !== undefined) {
            question.correctAnswer = correctAnswer;
        }

        // Update Marks
        if (marks !== undefined) {
            if (!Number.isInteger(marks) || marks < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Marks must be a positive integer"
                });
            }

            question.marks = marks;
        }

        // Update Difficulty
        if (difficulty !== undefined) {
            if (!["easy", "medium", "hard"].includes(difficulty)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid difficulty level"
                });
            }

            question.difficulty = difficulty;
        }

        // Update Explanation
        if (explanation !== undefined) {
            if (typeof explanation !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Explanation must be a string"
                });
            }

            question.explanation = explanation;
        }

        // Validate Final MCQ Data
        if (question.questionType === "mcq") {
            if (
                !Array.isArray(question.options) ||
                question.options.length < 2 ||
                question.options.some(
                    option => typeof option !== "string" || !option.trim()
                ) ||
                typeof question.correctAnswer !== "string" ||
                !question.correctAnswer.trim() ||
                !question.options.includes(question.correctAnswer.trim())
            ) {
                return res.status(400).json({
                    success: false,
                    message: "MCQ requires at least 2 valid options and a correct answer matching one option"
                });
            }
        } else {
            question.options = [];
            question.correctAnswer = null;
        }

        await question.save();

        res.status(200).json({
            success: true,
            message: "Question updated successfully!",
            question
        });

    } catch (error) {
        console.error("Update Question Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Delete Question
const deleteQuestion = async (req, res) => {
    try {
        const { assessmentId, questionId } = req.params;

        // Validate IDs
        if (
            !mongoose.Types.ObjectId.isValid(assessmentId) ||
            !mongoose.Types.ObjectId.isValid(questionId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid assessment or question ID"
            });
        }

        // Check Assessment Ownership
        const assessment = await Assessment.findOne({
            _id: assessmentId,
            createdBy: req.user._id
        });

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found or access denied"
            });
        }

        // Find and Delete Question
        const question = await Question.findOneAndDelete({
            _id: questionId,
            assessment: assessmentId
        });

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Question deleted successfully!"
        });

    } catch (error) {
        console.error("Delete Question Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Get Questions for Candidate (Without Correct Answers)
const getCandidateQuestions = async (req, res) => {
    try {
        const { assessmentId } = req.params;

        // Validate Assessment ID
        if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid assessment ID"
            });
        }

        // Check whether assessment is published
        const assessment = await Assessment.findOne({
            _id: assessmentId,
            status: "published"
        });

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Published assessment not found"
            });
        }

        // Fetch questions without correct answers or explanations
        const questions = await Question.find({
            assessment: assessmentId
        })
            .select("-correctAnswer -explanation")
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            count: questions.length,
            questions
        });

    } catch (error) {
        console.error("Get Candidate Questions Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    addQuestion,
    addMultipleQuestions,
    getAssessmentQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    getCandidateQuestions
};