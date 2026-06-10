import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Footbar from "./components/layout/Footbar";
import Navbar from "./components/layout/Navbar";
import { AuthProvider } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import LocationInput from "./pages/LocationInput";
import RiskOverview from "./pages/RiskOverview";
import HomeQuestionnaire from "./pages/HomeQuestionnaire";
import ScoreDashboard from "./pages/ScoreDashboard";
import Recovery from "./pages/Recovery";
import Reports from "./pages/Reports";

function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-parchment">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/location" element={<LocationInput />} />
          <Route path="/risk" element={<RiskOverview />} />
          <Route path="/questionnaire" element={<HomeQuestionnaire />} />
          <Route path="/dashboard" element={<ScoreDashboard />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/user-info" element={<Navigate to="/reports" replace />} />
        </Routes>
      </div>
      <Footbar />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
