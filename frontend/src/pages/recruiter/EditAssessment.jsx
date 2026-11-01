import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

import {
  getAssessmentById,
  updateAssessment,
} from "../../services/assessmentService";

function EditAssessment() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    totalMarks: "",
    passingMarks: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load existing assessment details
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const data = await getAssessmentById(assessmentId);
        const assessment = data.assessment;

        setFormData({
          title: assessment.title,
          description: assessment.description,
          duration: assessment.duration,
          totalMarks: assessment.totalMarks,
          passingMarks: assessment.passingMarks,
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load assessment."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update assessment
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      Number(formData.passingMarks) >
      Number(formData.totalMarks)
    ) {
      setError("Passing marks cannot exceed total marks.");
      return;
    }

    try {
      setSaving(true);

      await updateAssessment(assessmentId, {
        ...formData,
        duration: Number(formData.duration),
        totalMarks: Number(formData.totalMarks),
        passingMarks: Number(formData.passingMarks),
      });

      navigate("/recruiter/assessments");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update assessment."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="text-center py-12 text-slate-500">
        Loading assessment...
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-950 text-white px-8 py-5">
        <h1 className="text-xl font-bold">AI Hiring Platform</h1>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <Link
          to="/recruiter/assessments"
          className="text-blue-600 flex items-center gap-2 mb-6"
        >
          <ArrowLeft size={18} />
          Back to Assessments
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-2">
            Edit Assessment
          </h2>

          <p className="text-slate-500 mb-6">
            Update your technical assessment details.
          </p>

          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-medium mb-2">
                Assessment Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-3"
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
                required
                rows="4"
                className="w-full border rounded-lg px-4 py-3"
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
                className="w-full border rounded-lg px-4 py-3"
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
                className="w-full border rounded-lg px-4 py-3"
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
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default EditAssessment;