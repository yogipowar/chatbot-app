import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Chatbot from "./components/Chatbot";
import "./App.css";
import "./index.css";
import LoginPage from './components/LoginPage';
import AdminPanel from './components/AdminPanel';
import HumanChat from './components/HumanChat';
import { socket } from "./components/socket"

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
    <Router basename="/chatbot-app">
      <Routes>
        <Route path="/" element={<Chatbot />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/*" element={<AdminPanel />} />
        <Route path="/human-chat" element={<HumanChat />} />
      </Routes>
    </Router>
  );
}

export default App;