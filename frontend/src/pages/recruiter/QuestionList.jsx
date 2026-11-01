
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, PlusCircle, Pencil, Trash2 } from "lucide-react";

import {
    getQuestions,
    deleteQuestion,
} from "../../services/questionService";

function QuestionList() {
    const { assessmentId } = useParams();

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchQuestions = async () => {
        try {
            setError("");

            const response = await getQuestions(assessmentId);

            setQuestions(response.questions || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load questions."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [assessmentId]);

    const handleDelete = async (questionId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this question?"
        );

        if (!confirmed) return;

        try {
            await deleteQuestion(assessmentId, questionId);

            setQuestions((prev) =>
                prev.filter((question) => question._id !== questionId)
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete question."
            );
        }
    };

    if (loading) {
        return (
            <p className="text-center py-12 text-slate-500">
                Loading questions...
            </p>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="bg-slate-950 text-white px-8 py-5">
                <h1 className="text-xl font-bold">
                    AI Hiring Platform
                </h1>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-10">
                <Link
                    to="/recruiter/assessments"
                    className="flex items-center gap-2 text-blue-600 mb-6"
                >
                    <ArrowLeft size={18} />
                    Back to Assessments
                </Link>

                <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">
                            Assessment Questions
                        </h2>
                        <p className="text-slate-500 mt-1">
                            Manage all questions in this assessment.
                        </p>
                    </div>

                    <Link
                        to={`/recruiter/assessments/${assessmentId}/questions/create`}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
                    >
                        <PlusCircle size={18} />
                        Add Question
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {questions.length === 0 ? (
                    <div className="bg-white rounded-xl p-10 text-center shadow-sm">
                        <h3 className="text-lg font-semibold mb-2">
                            No questions found
                        </h3>
                        <p className="text-slate-500">
                            Start by adding your first question.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {questions.map((question, index) => (
                            <div
                                key={question._id}
                                className="bg-white rounded-xl p-6 shadow-sm"
                            >
                                <div className="flex flex-wrap justify-between gap-3 mb-4">
                                    <span className="font-semibold text-slate-500">
                                        Question {index + 1}
                                    </span>

                                    <div className="flex flex-wrap gap-2">
                                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                                            {question.questionType.toUpperCase()}
                                        </span>

                                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                                            {question.difficulty}
                                        </span>

                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                                            {question.marks} Marks
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold mb-4">
                                    {question.questionText}
                                </h3>

                                {question.questionType === "mcq" && (
                                    <div className="space-y-2 mb-4">
                                        {question.options?.map((option, optionIndex) => (
                                            <div
                                                key={optionIndex}
                                                className="bg-slate-50 border rounded-lg px-4 py-3"
                                            >
                                                <span className="font-medium mr-2">
                                                    {String.fromCharCode(65 + optionIndex)}.
                                                </span>
                                                {option}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {question.explanation && (
                                    <p className="text-sm text-slate-500 mb-4">
                                        <strong>Explanation:</strong>{" "}
                                        {question.explanation}
                                    </p>
                                )}

                                <div className="border-t pt-4 flex justify-end gap-3">
                                    <Link
                                        to={`/recruiter/assessments/${assessmentId}/questions/${question._id}/edit`}
                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        <Pencil size={17} />
                                        Edit
                                    </Link>

                                    <button
                                        onClick={() => handleDelete(question._id)}
                                        className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium"
                                    >
                                        <Trash2 size={17} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default QuestionList;
