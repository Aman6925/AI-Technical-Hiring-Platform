const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
    {
        assessment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assessment",
            required: true
        },

        questionText: {
            type: String,
            required: true,
            trim: true
        },

        questionType: {
            type: String,
            enum: ["mcq", "coding"],
            required: true
        },

        options: [
            {
                type: String,
                trim: true
            }
        ],

        correctAnswer: {
            type: String,
            default: null
        },

        marks: {
            type: Number,
            required: true,
            min: 1
        },

        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            default: "medium"
        },

        explanation: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;