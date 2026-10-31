
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Trash2, PlusCircle } from "lucide-react";
import {
  getAssessments,
  deleteAssessment,
} from "../../services/assessmentService";

function AssessmentList() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAssessments = async () => {
    try {
      setError("");
      const data = await getAssessments();

      if (data.success) {
        setAssessments(data.assessments);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load assessments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleDelete = async (assessmentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assessment?"
    );

    if (!confirmed) return;

    try {
      await deleteAssessment(assessmentId);

      setAssessments((prev) =>
        prev.filter((assessment) => assessment._id !== assessmentId)
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete assessment."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-950 text-white px-8 py-5">
        <h1 className="text-xl font-bold">AI Hiring Platform</h1>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <Link
              to="/recruiter/dashboard"
              className="text-blue-600 flex items-center gap-2 mb-4"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </Link>

            <h2 className="text-3xl font-bold">
              My Assessments
            </h2>

            <p className="text-slate-500 mt-2">
              View and manage your technical assessments.
            </p>
          </div>

          <Link
            to="/recruiter/create-assessment"
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
          >
            <PlusCircle size={20} />
            Create Assessment
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center py-12 text-slate-500">
            Loading assessments...
          </p>
        ) : assessments.length === 0 ? (
          <div className="bg-white p-10 rounded-xl text-center shadow-sm">
            <FileText size={40} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-bold">No assessments found</h3>
            <p className="text-slate-500 mt-2">
              Create your first technical assessment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assessments.map((assessment) => (
              <div
                key={assessment._id}
                className="bg-white p-6 rounded-xl shadow-sm"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {assessment.title}
                    </h3>

                    <p className="text-slate-500 mt-2">
                      {assessment.description}
                    </p>
                  </div>

                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 capitalize">
                    {assessment.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                  <div>
                    <p className="text-slate-500">Duration</p>
                    <p className="font-semibold">
                      {assessment.duration} minutes
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">Total Marks</p>
                    <p className="font-semibold">
                      {assessment.totalMarks}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">Passing Marks</p>
                    <p className="font-semibold">
                      {assessment.passingMarks}
                    </p>
                  </div>
                </div>

                <div className="border-t mt-6 pt-4 flex justify-end">
                  <button
                    onClick={() => handleDelete(assessment._id)}
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

export default AssessmentList;
