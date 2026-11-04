import { useEffect, useState } from "react";
import { ClipboardList, Trophy, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getAssessments } from "../../services/assessmentService";

function CandidateDashboard() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setError("");

        const response = await getAssessments();

        if (response.success) {
          setAssessments(response.assessments || []);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Failed to load assessments."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  const availableCount = assessments.length;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-950 text-white px-8 py-5 flex justify-between items-center">
        <h1 className="text-xl font-bold">AI Hiring Platform</h1>

        <span className="text-sm text-slate-300">
          Candidate Dashboard
        </span>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Welcome, Candidate!
          </h2>

          <p className="text-slate-500 mt-2">
            Prepare, practice and prove your technical skills.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <ClipboardList className="text-blue-600 mb-4" size={30} />
            <h3 className="text-2xl font-bold">{availableCount}</h3>
            <p className="text-slate-500">Available Assessments</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <Trophy className="text-green-600 mb-4" size={30} />
            <h3 className="text-2xl font-bold">0</h3>
            <p className="text-slate-500">Completed Assessments</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <Clock className="text-purple-600 mb-4" size={30} />
            <h3 className="text-2xl font-bold">0</h3>
            <p className="text-slate-500">Pending Assessments</p>
          </div>
        </div>

        {/* Available Assessments */}
        <div className="bg-white rounded-xl shadow-sm p-8 mt-8">
          <h3 className="text-xl font-bold mb-3">
            Available Assessments
          </h3>

          <p className="text-slate-500 mb-6">
            Explore published technical assessments.
          </p>

          {loading ? (
            <p className="text-slate-500 text-center py-10">
              Loading assessments...
            </p>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-600 mb-4">{error}</p>

              <button
                onClick={() => window.location.reload()}
                className="text-blue-600 font-semibold"
              >
                Try Again
              </button>
            </div>
          ) : assessments.length === 0 ? (
            <div className="border border-dashed border-slate-300 rounded-lg p-10 text-center">
              <ClipboardList
                size={40}
                className="mx-auto text-slate-400 mb-4"
              />

              <p className="text-slate-500">
                No published assessments available yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assessments.map((assessment) => (
                <div
                  key={assessment._id}
                  className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="text-lg font-bold text-slate-900">
                      {assessment.title}
                    </h4>

                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                      Published
                    </span>
                  </div>

                  <p className="text-slate-500 mt-3">
                    {assessment.description || "No description available."}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
                    <div>
                      <p className="text-slate-400">Duration</p>
                      <p className="font-semibold text-slate-700">
                        {assessment.duration} minutes
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400">Total Marks</p>
                      <p className="font-semibold text-slate-700">
                        {assessment.totalMarks}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400">Passing Marks</p>
                      <p className="font-semibold text-slate-700">
                        {assessment.passingMarks}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/candidate/assessments/${assessment._id}`}
                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                  >
                    View Details
                    <ArrowRight size={18} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default CandidateDashboard;