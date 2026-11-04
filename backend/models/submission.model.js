
const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
    {
        assessment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assessment",
            required: true
        },

        candidate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        answers: [
            {
                question: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Question",
                    required: true
                },

                selectedAnswer: {
                    type: String,
                    default: ""
                },

                isCorrect: {
                    type: Boolean,
                    default: false
                },

                marksObtained: {
                    type: Number,
                    default: 0
                }
            }
        ],

        totalMarks: {
            type: Number,
            required: true
        },

        marksObtained: {
            type: Number,
            default: 0
        },

        status: {
            type: String,
            enum: ["in-progress", "submitted", "evaluated"],
            default: "in-progress"
        },

        startedAt: {
            type: Date,
            default: Date.now
        },

        expiresAt: {
            type: Date,
            default: null
        },

        submittedAt: {
            type: Date,
            default: null
        },

        evaluatedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Prevent duplicate attempts for the same candidate and assessment
submissionSchema.index(
    { assessment: 1, candidate: 1 },
    { unique: true }
);

const Submission = mongoose.model("Submission", submissionSchema);

module.exports = Submission;
