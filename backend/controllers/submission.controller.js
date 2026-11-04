
const mongoose = require("mongoose");

const Submission = require("../models/submission.model");
const Assessment = require("../models/assessment.model");
const Question = require("../models/question.model");

// Start Assessment
const startAssessment = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const candidateId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid assessment ID"
            });
        }

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

        const existingSubmission = await Submission.findOne({
            assessment: assessmentId,
            candidate: candidateId
        });

        if (existingSubmission) {
            return res.status(409).json({
                success: false,
                message: "You have already started or submitted this assessment"
            });
        }

        const questionCount = await Question.countDocuments({
            assessment: assessmentId
        });

        if (questionCount === 0) {
            return res.status(400).json({
                success: false,
                message: "This assessment has no questions"
            });
        }

        const submission = await Submission.create({
            assessment: assessmentId,
            candidate: candidateId,
            totalMarks: assessment.totalMarks,
            status: "in-progress"
        });

        return res.status(201).json({
            success: true,
            message: "Assessment started successfully",
            submission: {
                _id: submission._id,
                assessment: submission.assessment,
                status: submission.status,
                totalMarks: submission.totalMarks,
                startedAt: submission.startedAt
            }
        });

    } catch (error) {
        console.error("Start Assessment Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Submit Assessment
const submitAssessment = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { answers } = req.body;
        const candidateId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(submissionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid submission ID"
            });
        }

        if (!Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: "Answers must be an array"
            });
        }

        const submission = await Submission.findOne({
            _id: submissionId,
            candidate: candidateId
        });

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });
        }

        if (submission.status !== "in-progress") {
            return res.status(400).json({
                success: false,
                message: "Assessment has already been submitted"
            });
        }

        const assessment = await Assessment.findById(submission.assessment);

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found"
            });
        }

        const questions = await Question.find({
            assessment: submission.assessment
        });

        const answerMap = new Map();

        for (const answer of answers) {
            if (!mongoose.Types.ObjectId.isValid(answer.questionId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid question ID"
                });
            }

            if (answerMap.has(answer.questionId)) {
                return res.status(400).json({
                    success: false,
                    message: "Duplicate question answers are not allowed"
                });
            }

            answerMap.set(answer.questionId, answer.selectedAnswer);
        }

        let marksObtained = 0;

        const evaluatedAnswers = questions.map((question) => {
            const selectedAnswer = answerMap.get(question._id.toString()) || "";

            const isCorrect =
                question.questionType === "mcq" &&
                selectedAnswer === question.correctAnswer;

            const marks = isCorrect ? question.marks : 0;

            marksObtained += marks;

            return {
                question: question._id,
                selectedAnswer,
                isCorrect,
                marksObtained: marks
            };
        });

        submission.answers = evaluatedAnswers;
        submission.marksObtained = marksObtained;
        submission.status = "evaluated";
        submission.submittedAt = new Date();
        submission.evaluatedAt = new Date();

        await submission.save();

        return res.status(200).json({
            success: true,
            message: "Assessment submitted successfully",
            result: {
                submissionId: submission._id,
                totalMarks: submission.totalMarks,
                marksObtained: submission.marksObtained,
                status: submission.status,
                submittedAt: submission.submittedAt
            }
        });

    } catch (error) {
        console.error("Submit Assessment Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    startAssessment,
    submitAssessment
};
