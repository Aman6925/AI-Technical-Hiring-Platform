
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, PlusCircle } from "lucide-react";

import { addQuestion } from "../../services/questionService";

function CreateQuestion() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    questionText: "",
    questionType: "mcq",
    options: ["", "", "", ""],
    correctAnswer: "",
    marks: 1,
    difficulty: "medium",
    explanation: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOptionChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((option, i) =>
        i === index ? value : option
      ),
    }));
  };

  const handleTypeChange = (e) => {
    const questionType = e.target.value;

    setFormData((prev) => ({
      ...prev,
      questionType,
      options: ["", "", "", ""],
      correctAnswer: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (Number(formData.marks) < 1) {
      setError("Marks must be at least 1.");
      return;
    }

    if (formData.questionType === "mcq") {
      const filledOptions = formData.options
        .map((option) => option.trim());

      if (filledOptions.some((option) => !option)) {
        setError("Please fill all four options.");
        return;
      }

      if (!formData.correctAnswer) {
        setError("Please select the correct answer.");
        return;
      }
    }

    const questionData = {
      questionText: formData.questionText.trim(),
      questionType: formData.questionType,
      marks: Number(formData.marks),
      difficulty: formData.difficulty,
      explanation: formData.explanation.trim(),
    };

    if (formData.questionType === "mcq") {
      questionData.options = formData.options.map((option) =>
        option.trim()
      );
      questionData.correctAnswer = formData.correctAnswer;
    }

    try {
      setLoading(true);

      await addQuestion(assessmentId, questionData);

      setSuccess("Question added successfully!");

      setFormData({
        questionText: "",
        questionType: "mcq",
        options: ["", "", "", ""],
        correctAnswer: "",
        marks: 1,
        difficulty: "medium",
        explanation: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to add question."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-950 text-white px-8 py-5">
        <h1 className="text-xl font-bold">
          AI Hiring Platform
        </h1>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <Link
          to="/recruiter/assessments"
          className="flex items-center gap-2 text-blue-600 mb-6"
        >
          <ArrowLeft size={18} />
          Back to Assessments
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-2">
            Add Question
          </h2>

          <p className="text-slate-500 mb-6">
            Create an MCQ or coding question for this assessment.
          </p>

          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-5">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-5">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-medium mb-2">
                Question Type
              </label>

              <select
                name="questionType"
                value={formData.questionType}
                onChange={handleTypeChange}
                className="w-full border rounded-lg px-4 py-3"
              >
                <option value="mcq">Multiple Choice (MCQ)</option>
                <option value="coding">Coding</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">
                Question
              </label>

              <textarea
                name="questionText"
                value={formData.questionText}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Enter your question..."
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            {formData.questionType === "mcq" && (
              <>
                <div>
                  <label className="block font-medium mb-3">
                    Options
                  </label>

                  <div className="space-y-3">
                    {formData.options.map((option, index) => (
                      <input
                        key={index}
                        type="text"
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        required
                        placeholder={`Option ${index + 1}`}
                        className="w-full border rounded-lg px-4 py-3"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-medium mb-2">
                    Correct Answer
                  </label>

                  <select
                    value={formData.correctAnswer}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        correctAnswer: e.target.value,
                      }))
                    }
                    required
                    className="w-full border rounded-lg px-4 py-3"
                  >
                    <option value="">Select correct option</option>

                    {formData.options.map((option, index) => (
                      <option
                        key={index}
                        value={option}
                        disabled={!option.trim()}
                      >
                        {`Option ${index + 1}: ${option || "(Empty)"}`}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block font-medium mb-2">
                Marks
              </label>

              <input
                type="number"
                name="marks"
                value={formData.marks}
                onChange={handleChange}
                min="1"
                required
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                Difficulty
              </label>

              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-2">
                Explanation (Optional)
              </label>

              <textarea
                name="explanation"
                value={formData.explanation}
                onChange={handleChange}
                rows="3"
                placeholder="Explain the correct answer..."
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <PlusCircle size={18} />
              {loading ? "Adding..." : "Add Question"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateQuestion;
