
import { useEffect, useState } from "react";
import {
  ClipboardList,
  Trophy,
  Clock,
  ArrowRight,
  Award,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getAssessments } from "../../services/assessmentService";
import { getMyPerformance } from "../../services/performanceService";

function CandidateDashboard() {
  const [assessments, setAssessments] = useState([]);
  const [performance, setPerformance] = useState(null);

  const [loading, setLoading] = useState(true);
  const [performanceLoading, setPerformanceLoading] = useState(true);

  const [error, setError] = useState("");
  const [performanceError, setPerformanceError] = useState("");

  // Fetch available assessments
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

  // Fetch candidate performance analytics
  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setPerformanceError("");

        const response = await getMyPerformance();

        if (response.success) {
          setPerformance(response);
        }
      } catch (err) {
        setPerformanceError(
          err.response?.data?.message ||
          "Failed to load performance analytics."
        );
      } finally {
        setPerformanceLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  // Performance calculations
  const results = performance?.results || [];

  const attemptedCount = performance?.count ?? results.length;

  const completedCount = performance?.completedCount ?? 0;

  const pendingCount = performance?.pendingCount ?? 0;

  const averageScore = performance?.averageScore ?? 0;

  const evaluatedResults = results.filter(
    (item) => item.status === "evaluated"
  );

  const highestScore = evaluatedResults.length
    ? Math.max(...evaluatedResults.map((item) => item.percentage || 0))
    : 0;

  // Sort results from oldest to newest for performance trend
  const chronologicalResults = [...evaluatedResults].sort(
    (a, b) => new Date(a.submittedAt) - new Date(b.submittedAt)
  );

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}
      <header className="bg-slate-950 text-white px-8 py-5 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          AI Hiring Platform
        </h1>

        <span className="text-sm text-slate-300">
          Candidate Dashboard
        </span>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Welcome, Candidate!
          </h2>

          <p className="text-slate-500 mt-2">
            Prepare, practice and prove your technical skills.
          </p>
        </div>

        {/* Performance Analytics */}
        <div className="mb-10">

          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            Performance Analytics
          </h3>

          <p className="text-slate-500 mb-6">
            Track your assessment performance and progress.
          </p>

          {performanceLoading ? (
            <div className="bg-white rounded-xl p-10 text-center">
              <p className="text-slate-500">
                Loading performance analytics...
              </p>
            </div>
          ) : performanceError ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <p className="text-red-600 mb-3">
                {performanceError}
              </p>

              <button
                onClick={() => window.location.reload()}
                className="text-blue-600 font-semibold"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Attempted */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <ClipboardList
                    className="text-blue-600 mb-4"
                    size={30}
                  />

                  <h4 className="text-3xl font-bold text-slate-900">
                    {attemptedCount}
                  </h4>

                  <p className="text-slate-500 mt-1">
                    Total Attempted
                  </p>
                </div>

                {/* Completed */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <Trophy
                    className="text-green-600 mb-4"
                    size={30}
                  />

                  <h4 className="text-3xl font-bold text-slate-900">
                    {completedCount}
                  </h4>

                  <p className="text-slate-500 mt-1">
                    Completed Assessments
                  </p>
                </div>

                {/* Average Score */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <TrendingUp
                    className="text-purple-600 mb-4"
                    size={30}
                  />

                  <h4 className="text-3xl font-bold text-slate-900">
                    {averageScore}%
                  </h4>

                  <p className="text-slate-500 mt-1">
                    Average Score
                  </p>
                </div>

                {/* Highest Score */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <Award
                    className="text-amber-500 mb-4"
                    size={30}
                  />

                  <h4 className="text-3xl font-bold text-slate-900">
                    {highestScore}%
                  </h4>

                  <p className="text-slate-500 mt-1">
                    Highest Score
                  </p>
                </div>

              </div>

              {/* Pending Assessments */}
              <div className="bg-white p-5 rounded-xl shadow-sm mt-6 flex items-center gap-4">
                <Clock className="text-orange-500" size={28} />

                <div>
                  <h4 className="text-xl font-bold">
                    {pendingCount}
                  </h4>

                  <p className="text-slate-500 text-sm">
                    Pending Assessments
                  </p>
                </div>
              </div>

              {/* Performance History */}
              <div className="bg-white rounded-xl shadow-sm p-6 mt-8">

                <div className="flex items-center gap-3 mb-6">
                  <CalendarDays
                    className="text-blue-600"
                    size={25}
                  />

                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Performance History
                    </h3>

                    <p className="text-sm text-slate-500">
                      Your assessment-wise results.
                    </p>
                  </div>
                </div>


                {/* Performance Trend Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6 mt-8">

                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900">
                      Performance Trend
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      Track your assessment scores over time.
                    </p>
                  </div>

                  {chronologicalResults.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                      Complete an assessment to view your performance trend.
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>100%</span>
                        <span>50%</span>
                        <span>0%</span>
                      </div>

                      <div className="relative border-b border-l border-slate-200 h-64 flex items-end justify-around gap-4 px-4">

                        {/* Grid lines */}
                        <div className="absolute inset-x-0 top-0 border-t border-dashed border-slate-200" />
                        <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-slate-200" />

                        {chronologicalResults.map((result, index) => {
                          const score = Math.min(
                            Math.max(Number(result.percentage) || 0, 0),
                            100
                          );

                          return (
                            <div
                              key={result.submissionId}
                              className="relative z-10 flex-1 h-full flex flex-col justify-end items-center min-w-0"
                            >

                              <span className="text-sm font-bold text-slate-700 mb-2">
                                {score}%
                              </span>

                              <div
                                title={`${result.assessmentTitle}: ${score}%`}
                                className="w-full max-w-16 bg-blue-600 hover:bg-blue-700 rounded-t-lg transition-all duration-300"
                                style={{
                                  height: `${Math.max(score, 2)}%`,
                                }}
                              />

                              <p className="text-xs text-slate-500 mt-3 truncate w-full text-center">
                                Test {index + 1}
                              </p>

                              <p className="text-xs text-slate-400 mb-2">
                                {formatDate(result.submittedAt)}
                              </p>

                            </div>
                          );
                        })}

                      </div>

                      <p className="text-center text-xs text-slate-400 mt-4">
                        Assessments are displayed in chronological order.
                      </p>
                    </>
                  )}

                </div>


                {results.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-slate-300 rounded-lg">
                    <Trophy
                      size={40}
                      className="mx-auto text-slate-400 mb-3"
                    />

                    <p className="text-slate-500">
                      You haven't attempted any assessments yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">

                    <table className="w-full text-left">

                      <thead>
                        <tr className="border-b bg-slate-50 text-slate-600 text-sm">
                          <th className="p-4">Assessment</th>
                          <th className="p-4">Marks</th>
                          <th className="p-4">Percentage</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Date</th>
                        </tr>
                      </thead>

                      <tbody>
                        {results.map((result) => (
                          <tr
                            key={result.submissionId}
                            className="border-b last:border-0 hover:bg-slate-50"
                          >
                            <td className="p-4 font-semibold text-slate-800">
                              {result.assessmentTitle}
                            </td>

                            <td className="p-4 text-slate-700">
                              {result.marksObtained} / {result.totalMarks}
                            </td>

                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-slate-800">
                                  {result.percentage}%
                                </span>

                                <div className="w-20 bg-slate-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{
                                      width: `${Math.min(
                                        Math.max(result.percentage || 0, 0),
                                        100
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </td>

                            <td className="p-4">
                              <span
                                className={`text-xs font-semibold px-3 py-1 rounded-full ${result.passStatus === "passed"
                                  ? "bg-green-100 text-green-700"
                                  : result.passStatus === "failed"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-orange-100 text-orange-700"
                                  }`}
                              >
                                {result.passStatus === "passed"
                                  ? "Passed"
                                  : result.passStatus === "failed"
                                    ? "Failed"
                                    : "Pending"}
                              </span>

                              <p className="text-xs text-slate-400 mt-2">
                                Passing: {result.passingMarks} marks
                              </p>
                            </td>

                            <td className="p-4 text-sm text-slate-500">
                              {formatDate(result.submittedAt)}
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
              <p className="text-red-600 mb-4">
                {error}
              </p>

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

        {/* Improvement Suggestions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-8">

          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Improvement Suggestions
          </h3>

          <p className="text-slate-500 text-sm mb-5">
            Recommendations based on your assessment results.
          </p>

          {evaluatedResults.length === 0 ? (
            <p className="text-slate-500">
              Complete an assessment to receive improvement suggestions.
            </p>
          ) : (
            <div className="space-y-4">

              {evaluatedResults
                .filter((result) => result.passStatus === "failed")
                .map((result) => (
                  <div
                    key={result.submissionId}
                    className="bg-red-50 border border-red-100 rounded-lg p-4"
                  >
                    <h4 className="font-semibold text-red-800">
                      Improve: {result.assessmentTitle}
                    </h4>

                    <p className="text-sm text-red-700 mt-2">
                      You scored {result.percentage}%.
                      You need {Math.max(
                        result.passingMarks - result.marksObtained,
                        0
                      )} more marks to reach the passing score.
                    </p>

                    <p className="text-sm text-slate-600 mt-2">
                      Recommendation: Revise the relevant technical concepts,
                      practice more questions and attempt similar assessments.
                    </p>
                  </div>
                ))}

              {evaluatedResults.every(
                (result) => result.passStatus === "passed"
              ) && (
                  <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800">
                      Great work!
                    </h4>

                    <p className="text-sm text-green-700 mt-2">
                      You have passed all evaluated assessments.
                      Continue practicing to improve your scores further.
                    </p>
                  </div>
                )}

            </div>
          )}

        </div>

      </main>
    </div>
  );
}

export default CandidateDashboard;
