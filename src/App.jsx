import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import LocationInput from "./pages/LocationInput";
import RiskOverview from "./pages/RiskOverview";
import HomeQuestionnaire from "./pages/HomeQuestionnaire";
import ScoreDashboard from "./pages/ScoreDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/location" element={<LocationInput />} />
        <Route path="/risk" element={<RiskOverview />} />
        <Route path="/questionnaire" element={<HomeQuestionnaire />} />
        <Route path="/dashboard" element={<ScoreDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;