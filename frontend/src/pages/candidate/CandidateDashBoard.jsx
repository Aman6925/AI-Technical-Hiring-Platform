
import { ClipboardList, Trophy, Clock, ArrowRight } from "lucide-react";

function CandidateDashboard() {
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
            <h3 className="text-2xl font-bold">0</h3>
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

        {/* Assessments */}
        <div className="bg-white rounded-xl shadow-sm p-8 mt-8">
          <h3 className="text-xl font-bold mb-3">
            Available Assessments
          </h3>

          <p className="text-slate-500 mb-6">
            Your assigned technical assessments will appear here.
          </p>

          <div className="border border-dashed border-slate-300 rounded-lg p-10 text-center">
            <ClipboardList
              size={40}
              className="mx-auto text-slate-400 mb-4"
            />

            <p className="text-slate-500">
              No assessments available yet.
            </p>

            <button className="mt-4 text-blue-600 font-semibold flex items-center gap-2 mx-auto">
              Explore Assessments
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CandidateDashboard;
