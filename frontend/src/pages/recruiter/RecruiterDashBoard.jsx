
import { useEffect, useState } from "react";
import { Users, FileText, Code, PlusCircle } from "lucide-react";
import { getAssessments } from "../../services/assessmentService";
import { Link } from "react-router-dom";
function RecruiterDashboard() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const data = await getAssessments();

        if (data.success) {
          setAssessments(data.assessments);
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

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-950 text-white px-8 py-5 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          AI Hiring Platform
        </h1>

        <span className="text-sm text-slate-300">
          Recruiter Dashboard
        </span>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Welcome, Recruiter!
          </h2>

          <p className="text-slate-500 mt-2">
            Manage assessments and evaluate candidates.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <FileText className="text-blue-600 mb-4" size={30} />

            <h3 className="text-2xl font-bold">
              {loading ? "..." : assessments.length}
            </h3>

            <p className="text-slate-500">Total Assessments</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <Users className="text-green-600 mb-4" size={30} />
            <h3 className="text-2xl font-bold">0</h3>
            <p className="text-slate-500">Total Candidates</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <Code className="text-purple-600 mb-4" size={30} />
            <h3 className="text-2xl font-bold">0</h3>
            <p className="text-slate-500">Coding Questions</p>
          </div>
        </div>

        {/* Create Assessment */}
        <div className="bg-white rounded-xl shadow-sm p-8 mt-8">
          <h3 className="text-xl font-bold mb-3">
            Assessment Management
          </h3>

          <p className="text-slate-500 mb-6">
            Create and manage technical assessments for candidates.
          </p>

          <Link
            to="/recruiter/create-assessment"
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 w-fit"
          >
            <PlusCircle size={20} />
            Create Assessment
          </Link>

          <Link
            to="/recruiter/assessments"
            className="inline-flex items-center gap-2 border border-blue-600 text-blue-600 px-5 py-3 rounded-lg hover:bg-blue-50 mt-4"
          >
            <FileText size={20} />
            View All Assessments
          </Link>
        </div>
      </main>
    </div>
  );
}

export default RecruiterDashboard;

