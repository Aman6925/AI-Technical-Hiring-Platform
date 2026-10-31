
const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        duration: {
            type: Number,
            required: true,
            min: 1
        },

        totalMarks: {
            type: Number,
            required: true,
            min: 1
        },

        passingMarks: {
            type: Number,
            required: true,
            min: 0
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: ["draft", "published", "closed"],
            default: "draft"
        }
    },
    {
        timestamps: true
    }
);

const Assessment = mongoose.model(
    "Assessment",
    assessmentSchema
);

module.exports = Assessment;
