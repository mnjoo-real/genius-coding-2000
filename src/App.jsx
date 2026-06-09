import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footbar from "./components/layout/Footbar";
import Navbar from "./components/layout/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import LocationInput from "./pages/LocationInput";
import RiskOverview from "./pages/RiskOverview";
import HomeQuestionnaire from "./pages/HomeQuestionnaire";
import ScoreDashboard from "./pages/ScoreDashboard";

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
        </Routes>
      </div>
      <Footbar />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
