import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Clock,
    ChevronLeft,
    ChevronRight,
    Send
} from "lucide-react";

import { getQuestions } from "../../services/questionService";

import {
    getAssessmentAttempt,
    saveAnswer,
    submitAssessment
} from "../../services/submissionService";

const AssessmentAttempt = () => {
    const { assessmentId, submissionId } = useParams();

    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [remainingSeconds, setRemainingSeconds] = useState(null);

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [saveError, setSaveError] = useState("");

    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);

    // Prevent duplicate submission requests
    const submittingRef = useRef(false);

    // Keep track of answer-saving requests
    const pendingSaves = useRef(new Set());

    // Format seconds into MM:SS or HH:MM:SS
    const formatTime = (seconds) => {
        const safeSeconds = Math.max(0, seconds);

        const hours = Math.floor(safeSeconds / 3600);
        const minutes = Math.floor((safeSeconds % 3600) / 60);
        const secs = safeSeconds % 60;

        if (hours > 0) {
            return [
                String(hours).padStart(2, "0"),
                String(minutes).padStart(2, "0"),
                String(secs).padStart(2, "0")
            ].join(":");
        }

        return [
            String(minutes).padStart(2, "0"),
            String(secs).padStart(2, "0")
        ].join(":");
    };

    // Submit Assessment
    const handleSubmit = async (autoSubmit = false) => {
        if (submittingRef.current || submitted) {
            return;
        }

        if (!autoSubmit) {
            const confirmSubmit = window.confirm(
                "Are you sure you want to submit your assessment?"
            );

            if (!confirmSubmit) return;
        }

        submittingRef.current = true;

        try {
            setSubmitting(true);
            setSubmitError("");

            // Wait for pending answer-saving requests
            await Promise.allSettled([
                ...pendingSaves.current
            ]);

            // Convert answers object into backend format
            const formattedAnswers = Object.entries(answers).map(
                ([questionId, selectedAnswer]) => ({
                    questionId,
                    selectedAnswer
                })
            );

            const response = await submitAssessment(
                submissionId,
                formattedAnswers
            );

            if (response.success && response.result) {
                setResult(response.result);
                setSubmitted(true);
                setRemainingSeconds(0);
            } else {
                throw new Error("Assessment submission failed.");
            }

        } catch (err) {
            setSubmitError(
                err.response?.data?.message ||
                err.message ||
                "Unable to submit assessment. Please try again."
            );

            submittingRef.current = false;

        } finally {
            setSubmitting(false);
        }
    };

    // Fetch questions and attempt details
    useEffect(() => {
        const fetchAssessmentData = async () => {
            try {
                setLoading(true);
                setError("");

                const [questionResponse, attemptResponse] =
                    await Promise.all([
                        getQuestions(assessmentId),
                        getAssessmentAttempt(submissionId)
                    ]);

                const questionList =
                    questionResponse.questions ||
                    questionResponse.data?.questions ||
                    [];

                const attempt = attemptResponse.submission;

                setQuestions(questionList);

                if (!attempt) {
                    throw new Error(
                        "Unable to load assessment attempt details."
                    );
                }

                // Load remaining time from backend
                setRemainingSeconds(attempt.remainingSeconds);
                // Restore previously saved answers
                const savedAnswers = {};

                (attempt.answers || []).forEach((answer) => {
                    savedAnswers[answer.questionId] = answer.selectedAnswer;
                });

                setAnswers(savedAnswers);

                // If already evaluated, show result
                if (
                    attempt.status === "evaluated" ||
                    attempt.status === "submitted"
                ) {
                    setResult({
                        submissionId,
                        totalMarks: attempt.totalMarks,
                        marksObtained: attempt.marksObtained,
                        status: attempt.status,
                        submittedAt: attempt.submittedAt
                    });

                    setSubmitted(true);
                }

            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Unable to load assessment."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAssessmentData();
    }, [assessmentId, submissionId]);

    // Countdown timer
    useEffect(() => {
        if (
            loading ||
            submitted ||
            remainingSeconds === null ||
            remainingSeconds <= 0
        ) {
            return;
        }

        const timer = setInterval(() => {
            setRemainingSeconds((prev) => {
                if (prev === null || prev <= 1) {
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [loading, submitted, remainingSeconds]);

    // Automatically submit when timer reaches zero
    useEffect(() => {
        if (
            !loading &&
            !submitted &&
            remainingSeconds === 0 &&
            !submittingRef.current
        ) {
            handleSubmit(true);
        }
    }, [remainingSeconds, loading, submitted]);

    // Save selected answer to backend
    const handleAnswerChange = (questionId, selectedAnswer) => {
        if (submitting || submitted || remainingSeconds <= 0) {
            return;
        }

        // Update the UI immediately
        setAnswers((prev) => ({
            ...prev,
            [questionId]: selectedAnswer
        }));

        setSaveError("");

        // Save answer in MongoDB
        const saveRequest = saveAnswer(
            submissionId,
            questionId,
            selectedAnswer
        )
            .catch((err) => {
                setSaveError(
                    err.response?.data?.message ||
                    "Unable to save your answer. Please check your connection."
                );

                return null;
            });

        pendingSaves.current.add(saveRequest);

        saveRequest.finally(() => {
            pendingSaves.current.delete(saveRequest);
        });
    };

    // Loading screen
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-lg text-gray-600">
                    Loading assessment...
                </p>
            </div>
        );
    }

    // Error screen
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    // Result screen
    if (submitted && result) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full text-center">

                    <div className="text-green-600 text-5xl mb-4">
                        ✓
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800">
                        Assessment Submitted!
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Your answers have been evaluated successfully.
                    </p>

                    <div className="bg-blue-50 rounded-lg p-6 mt-6">
                        <p className="text-gray-500">
                            Your Score
                        </p>

                        <h3 className="text-4xl font-bold text-blue-600 mt-2">
                            {result.marksObtained} / {result.totalMarks}
                        </h3>
                    </div>

                    <p className="text-sm text-gray-500 mt-5">
                        Status: {result.status}
                    </p>

                    <p className="text-sm text-gray-500 mt-2">
                        Submitted:{" "}
                        {result.submittedAt
                            ? new Date(result.submittedAt).toLocaleString()
                            : "Just now"}
                    </p>
                </div>
            </div>
        );
    }

    // Empty questions
    if (questions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600">
                    No questions are available for this assessment.
                </p>
            </div>
        );
    }

    const question = questions[currentQuestion];

    return (
        <div className="min-h-screen bg-gray-100">

            {/* Header */}
            <header className="bg-white shadow-sm px-6 py-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">

                    <h1 className="text-xl font-bold text-gray-800">
                        AI Hiring Platform
                    </h1>

                    <div
                        className={`flex items-center gap-2 font-semibold ${remainingSeconds <= 60
                                ? "text-red-600"
                                : "text-blue-600"
                            }`}
                    >
                        <Clock size={20} />

                        <span>
                            {remainingSeconds !== null
                                ? formatTime(remainingSeconds)
                                : "Loading timer..."}
                        </span>
                    </div>

                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto p-6">

                <div className="bg-white rounded-xl shadow-sm p-6">

                    {/* Assessment Information */}
                    <div className="flex justify-between items-center mb-6">

                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Assessment
                            </h2>

                            <p className="text-gray-500 mt-1">
                                Answer all questions carefully.
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-sm text-gray-500">
                                Total Questions
                            </p>

                            <p className="text-xl font-bold">
                                {questions.length}
                            </p>
                        </div>

                    </div>

                    <hr className="mb-6" />

                    {/* Question */}
                    <div className="mb-6">

                        <p className="text-sm text-blue-600 font-semibold mb-2">
                            Question {currentQuestion + 1} of {questions.length}
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800">
                            {question.questionText}
                        </h3>

                        <p className="text-sm text-gray-500 mt-2">
                            Marks: {question.marks}
                        </p>

                    </div>

                    {/* Options */}
                    <div className="space-y-3">

                        {(question.options || []).map((option, index) => (
                            <label
                                key={index}
                                className={`flex items-center gap-3 border rounded-lg p-4 ${submitting || remainingSeconds <= 0
                                        ? "opacity-60 cursor-not-allowed"
                                        : "cursor-pointer hover:bg-blue-50"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name={question._id}
                                    value={option}
                                    checked={
                                        answers[question._id] === option
                                    }
                                    disabled={
                                        submitting ||
                                        remainingSeconds <= 0
                                    }
                                    onChange={() =>
                                        handleAnswerChange(
                                            question._id,
                                            option
                                        )
                                    }
                                />

                                <span>{option}</span>
                            </label>
                        ))}

                    </div>

                    {/* Save Status */}
                    {saveError && (
                        <p className="text-red-600 text-sm mt-4">
                            {saveError}
                        </p>
                    )}

                    {/* Submit Error */}
                    {submitError && (
                        <p className="text-red-600 text-sm mt-4">
                            {submitError}
                        </p>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between mt-8">

                        <button
                            onClick={() =>
                                setCurrentQuestion((prev) => prev - 1)
                            }
                            disabled={
                                currentQuestion === 0 ||
                                submitting
                            }
                            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-200 disabled:opacity-50"
                        >
                            <ChevronLeft size={18} />
                            Previous
                        </button>

                        {currentQuestion < questions.length - 1 ? (

                            <button
                                onClick={() =>
                                    setCurrentQuestion((prev) => prev + 1)
                                }
                                disabled={submitting}
                                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
                            >
                                Next
                                <ChevronRight size={18} />
                            </button>

                        ) : (

                            <button
                                onClick={() => handleSubmit(false)}
                                disabled={submitting || submitted}
                                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 text-white disabled:opacity-50"
                            >
                                {submitting
                                    ? "Submitting..."
                                    : "Submit Assessment"}

                                <Send size={18} />
                            </button>

                        )}

                    </div>

                    {/* Attempt Information */}
                    <p className="text-xs text-gray-400 mt-5">
                        Attempt ID: {submissionId}
                    </p>

                </div>

            </main>
        </div>
    );
};

export default AssessmentAttempt;
