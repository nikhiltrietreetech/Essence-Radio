import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import OtpVerificationPage from "./pages/OtpVerificationPage";

import Navbar from "./components/Navbar";
import EssenceRadio from "./components/EssenceRadio";

function App() {
  return (
    <>
    
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-otp" element={<OtpVerificationPage />} />
          <Route path="/essenceRadio" element={<EssenceRadio />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
