import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Chatbot from "./components/Chatbot";
import "./App.css";
import "./index.css";
import LoginPage from './components/LoginPage';
import AdminPanel from './components/AdminPanel';
import HumanChat from './components/HumanChat';
import { socket } from "./components/socket"
import Plans from './components/plans';
import OwnerDashboard from './components/OwnerDashboard';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OwnerAccount from './components/OwnerAccount';
import Invoice from './components/Invoice';
import Integration from './components/Integration';

function App() {
  const [auth, setAuth] = useState({ isLoggedIn: false, role: '' });

  // socket.on("connect", () => {
  //   console.log("✅ Connected:", socket.id);
  // });

  // useEffect(() => {
  //   socket.on("receive_message", (data) => {
  //     console.log('received from server ', data)
  //     alert("msg recieved")
  //   })
  // }, [])

  const sendMessage = () => {
    socket.emit("send_message", {
      message: "sent from frontend",
      socketId: socket.id
    });
  }

  return (
    <>
      <Router>
        <Routes>
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/*" element={<AdminPanel />} />
          <Route path="/human-chat" element={<HumanChat />} />
          <Route path="/dashboard" element={<OwnerDashboard />} />
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/my-account" element={<OwnerAccount />} />
          <Route path="/integration" element={<Integration />} />
          <Route path="/" element={<Plans />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;