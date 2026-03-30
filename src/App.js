import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import SubmitTask from "./pages/SubmitTask";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/submit-task" element={<SubmitTask />} />
      </Routes>
    </Router>
  );
}

export default App;
