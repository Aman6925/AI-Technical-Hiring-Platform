
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Trophy,
  ClipboardList
} from "lucide-react";

import { getAssessmentById } from "../../services/assessmentService";
import { startAssessment } from "../../services/submissionService";

function AssessmentDetails() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [startError, setStartError] = useState("");

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setError("");

        const response = await getAssessmentById(assessmentId);

        if (response.success) {
          setAssessment(response.assessment);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Failed to load assessment details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId]);

  // Start Assessment
  const handleStartAssessment = async () => {
    try {
      setStarting(true);
      setStartError("");

      const response = await startAssessment(assessmentId);

      if (response.success) {
        navigate(
          `/candidate/assessments/${assessmentId}/attempt/${response.submission._id}`
        );
      }
    } catch (err) {
      setStartError(
        err.response?.data?.message ||
        "Unable to start assessment. Please try again."
      );
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">
          Loading assessment details...
        </p>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100">
        <p className="text-red-600 mb-4">
          {error || "Assessment not found."}
        </p>

        <Link
          to="/candidate/dashboard"
          className="text-blue-600 font-semibold"
        >
          Back to Dashboard
        </Link>
      </div>
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
          to="/candidate/dashboard"
          className="inline-flex items-center gap-2 text-blue-600 font-semibold mb-8"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h2 className="text-3xl font-bold text-slate-900">
              {assessment.title}
            </h2>

            <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-semibold">
              {assessment.status}
            </span>
          </div>

          <p className="text-slate-500 mt-4 leading-relaxed">
            {assessment.description || "No description available."}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8">
            <div className="bg-blue-50 p-5 rounded-lg">
              <Clock className="text-blue-600 mb-3" size={28} />
              <p className="text-sm text-slate-500">Duration</p>
              <h3 className="text-xl font-bold">
                {assessment.duration} Minutes
              </h3>
            </div>

            <div className="bg-green-50 p-5 rounded-lg">
              <Trophy className="text-green-600 mb-3" size={28} />
              <p className="text-sm text-slate-500">Total Marks</p>
              <h3 className="text-xl font-bold">
                {assessment.totalMarks}
              </h3>
            </div>

            <div className="bg-purple-50 p-5 rounded-lg">
              <ClipboardList
                className="text-purple-600 mb-3"
                size={28}
              />
              <p className="text-sm text-slate-500">Passing Marks</p>
              <h3 className="text-xl font-bold">
                {assessment.passingMarks}
              </h3>
            </div>
          </div>

          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-bold mb-3">
              Assessment Created By
            </h3>

            <p className="text-slate-600">
              {assessment.createdBy?.name || "Recruiter"}
            </p>
          </div>

          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-bold mb-4">
              Assessment Instructions
            </h3>

            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Read each question carefully.</li>
              <li>
                Manage your time according to the assessment duration.
              </li>
              <li>
                Submit your answers before the assessment ends.
              </li>
              <li>
                Your performance will be evaluated after submission.
              </li>
            </ul>
          </div>

          <div className="mt-8 border-t pt-6">
            {startError && (
              <p className="text-red-600 text-sm text-center mb-4">
                {startError}
              </p>
            )}

            <button
              onClick={handleStartAssessment}
              disabled={starting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-lg font-bold transition"
            >
              {starting ? "Starting Assessment..." : "Start Assessment"}
            </button>

            <p className="text-center text-sm text-slate-400 mt-3">
              Make sure you are ready before starting the assessment.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AssessmentDetails;
