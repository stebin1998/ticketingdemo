
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BuyerLogin from "./auth/BuyerLogin";
import BuyerSignup from "./auth/BuyerSignup";  
import BuyerDashboard from "./pages/BuyerDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BuyerLogin />} />
        <Route path="/signup" element={<BuyerSignup />} />  {/* New Signup Route */}
        <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
