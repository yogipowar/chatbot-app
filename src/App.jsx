import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Chatbot from "./components/Chatbot";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import "./App.css";
import "./index.css";

function App() {
  // auth state to manage access to the admin panel
  const [auth, setAuth] = useState({ isLoggedIn: false, role: '' });

  return (
    <Router basename="/chatbot-app">
      <Routes>
        <Route path="/" element={<Chatbot />} />
        <Route path="/login" element={<Login setAuth={setAuth} />} />
        <Route path="/admin/*" element={<AdminDashboard role={auth.role} />} />
      </Routes>
    </Router>
  );
}

export default App;