import { submitAssessment } from "../../services/submissionService";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Clock,
    ChevronLeft,
    ChevronRight,
    Send
} from "lucide-react";

import { getQuestions } from "../../services/questionService";

const AssessmentAttempt = () => {
    const { assessmentId, submissionId } = useParams();

    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);

    // Fetch candidate questions from backend
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getQuestions(assessmentId);

                const questionList =
                    response.questions ||
                    response.data?.questions ||
                    [];

                setQuestions(questionList);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load assessment questions."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [assessmentId]);

    // Save selected answer
    const handleAnswerChange = (questionId, selectedAnswer) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: selectedAnswer
        }));
    };

    const handleSubmit = async () => {
        const confirmSubmit = window.confirm(
            "Are you sure you want to submit your assessment?"
        );

        if (!confirmSubmit) return;

        try {
            setSubmitting(true);
            setSubmitError("");

            // Convert answers object into backend's expected format
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

            if (response.success) {
                setResult(response.result);
                setSubmitted(true);
            }
        } catch (err) {
            setSubmitError(
                err.response?.data?.message ||
                "Unable to submit assessment. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Loading screen
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-lg text-gray-600">
                    Loading assessment questions...
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

    // Assessment Result Screen
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
            <header className="bg-white shadow-sm px-6 py-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">
                        AI Hiring Platform
                    </h1>

                    <div className="flex items-center gap-2 text-red-600">
                        <Clock size={20} />
                        <span className="font-semibold">
                            Timer: Coming soon
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-6">
                <div className="bg-white rounded-xl shadow-sm p-6">

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

                    <div className="space-y-3">
                        {(question.options || []).map((option, index) => (
                            <label
                                key={index}
                                className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:bg-blue-50"
                            >
                                <input
                                    type="radio"
                                    name={question._id}
                                    value={option}
                                    checked={answers[question._id] === option}
                                    onChange={() =>
                                        handleAnswerChange(question._id, option)
                                    }
                                />

                                <span>{option}</span>
                            </label>
                        ))}
                    </div>

                    <div className="flex justify-between mt-8">
                        <button
                            onClick={() =>
                                setCurrentQuestion((prev) => prev - 1)
                            }
                            disabled={currentQuestion === 0}
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
                                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white"
                            >
                                Next
                                <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || submitted}
                                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 text-white disabled:opacity-50"
                            >
                                {submitting
                                    ? "Submitting..."
                                    : submitted
                                        ? "Assessment Submitted"
                                        : "Submit Assessment"}
                                <Send size={18} />
                            </button>
                        )}

                        {submitError && (
                            <p className="text-red-600 text-sm mt-4">
                                {submitError}
                            </p>
                        )}

                        {submitted && (
                            <p className="text-green-600 font-semibold mt-4">
                                Assessment submitted successfully!
                            </p>
                        )}
                    </div>

                    <p className="text-xs text-gray-400 mt-5">
                        Attempt ID: {submissionId}
                    </p>
                </div>
            </main>
        </div>
    );
};

export default AssessmentAttempt;
