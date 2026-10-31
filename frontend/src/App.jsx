import CreateAssessment from "./pages/recruiter/CreateAssessment";
import { Routes, Route, Link } from "react-router-dom";
import AssessmentList from "./pages/recruiter/AssessmentList";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
      <h1 className="text-4xl font-bold mb-4 text-center">
        AI Technical Hiring Platform
      </h1>

      <p className="text-slate-400 mb-8 text-center">
        Smart Recruitment. Intelligent Assessment.
      </p>

      <div className="flex gap-4">
        <Link
          to="/login"
          className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Login
        </Link>

        <Link
          to="/register"
          className="border border-slate-500 px-6 py-3 rounded-lg hover:bg-slate-800"
        >
          Register
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/recruiter/dashboard"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <RecruiterDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recruiter/create-assessment"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <CreateAssessment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recruiter/assessments"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <AssessmentList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/candidate/dashboard"
        element={
          <ProtectedRoute allowedRoles={["candidate"]}>
            <CandidateDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;



