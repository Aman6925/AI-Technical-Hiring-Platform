import CreateAssessment from "./pages/recruiter/CreateAssessment";
import { Routes, Route, Link } from "react-router-dom";
import AssessmentList from "./pages/recruiter/AssessmentList";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import RecruiterDashboard from "./pages/recruiter/RecruiterDashBoard";
import CandidateDashboard from "./pages/candidate/CandidateDashBoard";
import ProtectedRoute from "./components/ProtectedRoute";
import EditAssessment from "./pages/recruiter/EditAssessment";
import CreateQuestion from "./pages/recruiter/CreateQuestion";
import QuestionList from "./pages/recruiter/QuestionList";
import EditQuestion from "./pages/recruiter/EditQuestion";

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
        path="/recruiter/assessments/:assessmentId/edit"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <EditAssessment />
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

      <Route
        path="/recruiter/assessments/:assessmentId/questions/create"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <CreateQuestion />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recruiter/assessments/:assessmentId/questions"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <QuestionList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recruiter/assessments/:assessmentId/questions/:questionId/edit"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <EditQuestion />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;


