import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Chatbot from "./components/Chatbot";
import "./App.css";
import "./index.css";
import LoginPage from './components/LoginPage';
import AdminPanel from './components/AdminPanel';

function App() {
  // auth state to manage access to the admin panel
  const [auth, setAuth] = useState({ isLoggedIn: false, role: '' });

  return (
    <Router basename="/chatbot-app">
      <Routes>
        <Route path="/" element={<Chatbot />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/*" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;