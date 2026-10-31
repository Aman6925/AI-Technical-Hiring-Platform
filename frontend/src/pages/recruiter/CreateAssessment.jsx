
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createAssessment } from "../../services/assessmentService";

function CreateAssessment() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    totalMarks: "",
    passingMarks: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (Number(formData.passingMarks) > Number(formData.totalMarks)) {
      setError("Passing marks cannot exceed total marks.");
      return;
    }

    setLoading(true);

    try {
      const response = await createAssessment({
        ...formData,
        duration: Number(formData.duration),
        totalMarks: Number(formData.totalMarks),
        passingMarks: Number(formData.passingMarks),
      });

      if (response.success) {
        alert("Assessment created successfully!");
        navigate("/recruiter/dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create assessment. Please try again."
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
          to="/recruiter/dashboard"
          className="text-blue-600 font-medium"
        >
          ← Back to Dashboard
        </Link>

        <div className="bg-white p-8 rounded-xl shadow-sm mt-6">
          <h2 className="text-2xl font-bold mb-2">
            Create Assessment
          </h2>

          <p className="text-slate-500 mb-8">
            Create a new technical assessment for candidates.
          </p>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-medium mb-2">
                Assessment Title
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Full Stack Developer Assessment"
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the assessment..."
                rows="4"
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                Duration (Minutes)
              </label>

              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="1"
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                Total Marks
              </label>

              <input
                type="number"
                name="totalMarks"
                value={formData.totalMarks}
                onChange={handleChange}
                min="1"
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                Passing Marks
              </label>

              <input
                type="number"
                name="passingMarks"
                value={formData.passingMarks}
                onChange={handleChange}
                min="0"
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-3"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Assessment"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateAssessment;
