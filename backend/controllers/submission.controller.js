
const mongoose = require("mongoose");

const Submission = require("../models/submission.model");
const Assessment = require("../models/assessment.model");
const Question = require("../models/question.model");

// Calculate assessment deadline
const getExpiryTime = (submission, assessment) => {
    if (submission.expiresAt) {
        return submission.expiresAt;
    }

    // Backward compatibility for old submissions
    const durationMs = Number(assessment.duration) * 60 * 1000;

    return new Date(
        submission.startedAt.getTime() + durationMs
    );
};

// Evaluate saved answers on the server
const evaluateSubmission = async (submission) => {
    const questions = await Question.find({
        assessment: submission.assessment
    });

    const answerMap = new Map();

    submission.answers.forEach((answer) => {
        answerMap.set(
            answer.question.toString(),
            answer.selectedAnswer || ""
        );
    });

    let marksObtained = 0;

    const evaluatedAnswers = questions.map((question) => {
        const selectedAnswer =
            answerMap.get(question._id.toString()) || "";

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

    return submission;
};

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

        if (
            !Number.isFinite(Number(assessment.duration)) ||
            Number(assessment.duration) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Assessment duration is invalid"
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

        const startedAt = new Date();

        const expiresAt = new Date(
            startedAt.getTime() +
            Number(assessment.duration) * 60 * 1000
        );

        const submission = await Submission.create({
            assessment: assessmentId,
            candidate: candidateId,
            totalMarks: assessment.totalMarks,
            startedAt,
            expiresAt,
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
                startedAt: submission.startedAt,
                expiresAt: submission.expiresAt,
                duration: assessment.duration
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

// Get Assessment Attempt and Remaining Time
const getAssessmentAttempt = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const candidateId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(submissionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid submission ID"
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

        const assessment = await Assessment.findById(
            submission.assessment
        );

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found"
            });
        }

        const expiresAt = getExpiryTime(submission, assessment);

        // Save calculated deadline for old submissions
        if (!submission.expiresAt) {
            submission.expiresAt = expiresAt;
            await submission.save();
        }

        let remainingSeconds = 0;

        if (submission.status === "in-progress") {
            remainingSeconds = Math.max(
                0,
                Math.ceil(
                    (expiresAt.getTime() - Date.now()) / 1000
                )
            );

            // Automatically evaluate if the deadline has passed
            if (remainingSeconds === 0) {
                await evaluateSubmission(submission);
            }
        }

        return res.status(200).json({
            success: true,
            submission: {
                _id: submission._id,
                status: submission.status,
                totalMarks: submission.totalMarks,
                marksObtained: submission.marksObtained,
                startedAt: submission.startedAt,
                expiresAt,
                remainingSeconds,
                duration: assessment.duration,
                answers: submission.answers.map((answer) => ({
                    questionId: answer.question.toString(),
                    selectedAnswer: answer.selectedAnswer
                }))
            }
        });

    } catch (error) {
        console.error("Get Attempt Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Save One Answer
const saveAnswer = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { questionId, selectedAnswer } = req.body;
        const candidateId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(submissionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid submission ID"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(questionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid question ID"
            });
        }

        if (typeof selectedAnswer !== "string") {
            return res.status(400).json({
                success: false,
                message: "Selected answer must be a string"
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
                message: "Assessment is no longer in progress"
            });
        }

        const assessment = await Assessment.findById(
            submission.assessment
        );

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found"
            });
        }

        const expiresAt = getExpiryTime(submission, assessment);

        if (Date.now() >= expiresAt.getTime()) {
            return res.status(400).json({
                success: false,
                message: "Assessment time has expired"
            });
        }

        const question = await Question.findOne({
            _id: questionId,
            assessment: submission.assessment
        });

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question does not belong to this assessment"
            });
        }

        const existingIndex = submission.answers.findIndex(
            (answer) =>
                answer.question.toString() === questionId
        );

        if (existingIndex >= 0) {
            submission.answers[existingIndex].selectedAnswer =
                selectedAnswer;
        } else {
            submission.answers.push({
                question: questionId,
                selectedAnswer
            });
        }

        await submission.save();

        return res.status(200).json({
            success: true,
            message: "Answer saved successfully"
        });

    } catch (error) {
        console.error("Save Answer Error:", error.message);

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

        if (answers !== undefined && !Array.isArray(answers)) {
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

        const assessment = await Assessment.findById(
            submission.assessment
        );

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found"
            });
        }

        const expiresAt = getExpiryTime(submission, assessment);
        const isExpired = Date.now() >= expiresAt.getTime();

        // Merge latest frontend answers with saved answers
        if (answers && !isExpired) {
            const questions = await Question.find({
                assessment: submission.assessment
            });

            const validQuestionIds = new Set(
                questions.map((question) => question._id.toString())
            );

            const answerMap = new Map();

            for (const answer of answers) {
                if (
                    !answer ||
                    !mongoose.Types.ObjectId.isValid(answer.questionId)
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid question ID"
                    });
                }

                if (!validQuestionIds.has(answer.questionId)) {
                    return res.status(400).json({
                        success: false,
                        message: "Question does not belong to this assessment"
                    });
                }

                if (typeof answer.selectedAnswer !== "string") {
                    return res.status(400).json({
                        success: false,
                        message: "Selected answer must be a string"
                    });
                }

                if (answerMap.has(answer.questionId)) {
                    return res.status(400).json({
                        success: false,
                        message: "Duplicate question answers are not allowed"
                    });
                }

                answerMap.set(
                    answer.questionId,
                    answer.selectedAnswer
                );
            }

            for (const [questionId, selectedAnswer] of answerMap) {
                const existingIndex = submission.answers.findIndex(
                    (answer) =>
                        answer.question.toString() === questionId
                );

                if (existingIndex >= 0) {
                    submission.answers[existingIndex].selectedAnswer =
                        selectedAnswer;
                } else {
                    submission.answers.push({
                        question: questionId,
                        selectedAnswer
                    });
                }
            }
        }

        // Persist final answers before evaluation
        await submission.save();

        const evaluatedSubmission = await evaluateSubmission(submission);

        return res.status(200).json({
            success: true,
            message: "Assessment submitted successfully",
            result: {
                submissionId: evaluatedSubmission._id,
                totalMarks: evaluatedSubmission.totalMarks,
                marksObtained: evaluatedSubmission.marksObtained,
                status: evaluatedSubmission.status,
                submittedAt: evaluatedSubmission.submittedAt
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
    getAssessmentAttempt,
    saveAnswer,
    submitAssessment
};
