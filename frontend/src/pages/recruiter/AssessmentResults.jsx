
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  CheckCircle,
  Clock,
  Trophy,
  RefreshCw
} from "lucide-react";
import { getAssessmentResults } from "../../services/submissionService";

function AssessmentResults() {
  const { assessmentId } = useParams();

  const [assessment, setAssessment] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAssessmentResults(assessmentId);

      if (data.success) {
        setAssessment(data.assessment);
        setResults(data.results);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to load assessment results."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [assessmentId]);

  const evaluated = results.filter(
    (item) => item.status === "evaluated"
  );

  const inProgress = results.filter(
    (item) => item.status === "in-progress"
  );

  const averageScore = evaluated.length
    ? (
        evaluated.reduce(
          (sum, item) => sum + item.percentage,
          0
        ) / evaluated.length
      ).toFixed(2)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-lg font-semibold text-slate-600">
          Loading results...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-950 text-white px-6 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">
            AI Hiring Platform
          </h1>

          <span className="text-sm text-slate-300">
            Recruiter Results
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">

        <Link
          to="/recruiter/assessments"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={18} />
          Back to Assessments
        </Link>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
            <button
              onClick={fetchResults}
              className="ml-3 underline font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {assessment && (
          <>
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  Assessment Results
                </h2>

                <p className="text-slate-500 mt-2">
                  {assessment.title}
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  Total Marks: {assessment.totalMarks}
                </p>
              </div>

              <button
                onClick={fetchResults}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 h-fit"
              >
                <RefreshCw size={18} />
                Refresh Results
              </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

              <StatCard
                icon={<Users size={28} />}
                title="Total Candidates"
                value={results.length}
                color="text-blue-600"
              />

              <StatCard
                icon={<CheckCircle size={28} />}
                title="Evaluated"
                value={evaluated.length}
                color="text-green-600"
              />

              <StatCard
                icon={<Clock size={28} />}
                title="In Progress"
                value={inProgress.length}
                color="text-orange-600"
              />

              <StatCard
                icon={<Trophy size={28} />}
                title="Average Score"
                value={`${averageScore}%`}
                color="text-purple-600"
              />

            </div>

            {/* Results Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">

              <div className="p-6 border-b">
                <h3 className="text-xl font-bold text-slate-900">
                  Candidate Performance
                </h3>

                <p className="text-slate-500 text-sm mt-1">
                  View candidate assessment scores and status.
                </p>
              </div>

              {results.length === 0 ? (
                <div className="p-10 text-center text-slate-500">
                  No candidates have attempted this assessment yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">

                    <thead className="bg-slate-50 text-slate-600 text-sm">
                      <tr>
                        <th className="p-4">Candidate</th>
                        <th className="p-4">Marks</th>
                        <th className="p-4">Percentage</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Submitted At</th>
                      </tr>
                    </thead>

                    <tbody>
                      {results.map((item) => (
                        <tr
                          key={item.submissionId}
                          className="border-t hover:bg-slate-50"
                        >
                          <td className="p-4">
                            <p className="font-semibold text-slate-900">
                              {item.candidate?.name || "Unknown"}
                            </p>

                            <p className="text-sm text-slate-500">
                              {item.candidate?.email || "No email"}
                            </p>
                          </td>

                          <td className="p-4 font-semibold">
                            {item.status === "evaluated"
                              ? `${item.marksObtained}/${item.totalMarks}`
                              : "—"}
                          </td>

                          <td className="p-4">
                            {item.status === "evaluated"
                              ? `${item.percentage}%`
                              : "—"}
                          </td>

                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                item.status === "evaluated"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>

                          <td className="p-4 text-sm text-slate-500">
                            {item.submittedAt
                              ? new Date(item.submittedAt).toLocaleString()
                              : "Not submitted"}
                          </td>
                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>
              )}

            </div>
          </>
        )}

      </main>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className={`${color} mb-4`}>
        {icon}
      </div>

      <h3 className="text-2xl font-bold text-slate-900">
        {value}
      </h3>

      <p className="text-slate-500 mt-1">
        {title}
      </p>
    </div>
  );
}

export default AssessmentResults;
