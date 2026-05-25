"use client";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../components/socket";
import { Eye, EyeOff } from "lucide-react";
import "./login.css";

const STATIC_EMAIL = "admin@admin.com";
const STATIC_PASSWORD = "admin123";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ Wait until socket connects
      if (!socket.id) {
        await new Promise<void>((resolve) => {
          socket.on("connect", () => resolve());
        });
      }

      if (email === STATIC_EMAIL && password === STATIC_PASSWORD) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", "1");
        localStorage.setItem("adminemail", email);
        localStorage.setItem("adminpassword", password);

        navigate("/admin");
        return;
      }

      const response = await fetch(
        "https://chatbotapi.scrollosoft.com/users/admin-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: email,
            password: password,
            socketId: socket.id, // ✅ PASS SOCKET ID
          }),
        }
      );

      const data = await response.json();

      if (data.status === true) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", "2");
        localStorage.setItem("adminemail", email);
        localStorage.setItem("adminpassword", password);
        localStorage.setItem("adminId", data.user.id);
        // localStorage.setItem(
        //   "subscription_status",
        //   data.user.subscription_status
        // );
        localStorage.setItem("createdAt", data.user.createdAt);

        navigate("/admin");
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      setForgotMessage("Please enter email");
      return;
    }

    setForgotLoading(true);
    setForgotMessage("");

    try {
      const resetLink = `${window.location.origin}/change-password?email=${forgotEmail}`;

      const response = await fetch(
        "https://chatbotapi.scrollosoft.com/users/send-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: forgotEmail,
            subject: "Reset Your Password",
            text: `Reset your password: ${resetLink}`,
            html: `
            <h2>Password Reset</h2>
            <p>Click below to reset your password:</p>
            <a href="${resetLink}" 
              style="display:inline-block;padding:10px 20px;background:#009DE1;color:#fff;border-radius:6px;text-decoration:none;">
              Reset Password
            </a>
          `,
          }),
        }
      );

      const data = await response.json();

      // ✅ FIX HERE
      if (data.success) {
        setForgotMessage("Reset link sent to your email!");
        setTimeout(() => {
          setShowForgotModal(false);
          resetForgotForm(); // ✅ clear after success
        }, 1500);
      } else {
        setForgotMessage(data.message || "Failed to send email");
      }
    } catch (err) {
      setForgotMessage("Something went wrong");
    }

    setForgotLoading(false);
  };

  const resetForgotForm = () => {
    setForgotEmail("");
    setForgotMessage("");
    setForgotLoading(false);
  };

  return (
    <>
      <div className="login-container">
        {/* LEFT SIDE */}
        {/* Top Right Circles */}
        <div className="circles">
          <div className="circle big"></div>
          <div className="circle small"></div>
        </div>
        <div className="login-left">
          <div className="overlay"></div>

          {/* Top Left Logo */}
          <div className="logo">
            <img className="logo-img" src="/logo.png" alt="" />
          </div>



          {/* Bottom Text */}
          <div className="left-text">
            <p>
              Let your AI agent handle every conversation. So you can focus on
              growing your business.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-right">
          <div className="login-box">
            <h1>WELCOME BACK</h1>
            <p className="subtitle">
              Enter your email and password to access your account
            </p>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group password-group">
                <label>Password</label>

                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />

                  <span
                    className="eye-icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span
                      className="eye-icon"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </span>
                  </span>
                </div>
              </div>
              <div className="forgot-password">
                <span onClick={() => setShowForgotModal(true)}>
                  Forgot Password?
                </span>
              </div>
              <button type="submit" disabled={loading} className="login-btn">
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* <div className="modal-footer-text">
            Don't have an account?{" "}
            <span
              className="login-link"
              onClick={() => navigate("/")}
            >
              Sign Up
            </span>
          </div> */}
          </div>
        </div>
      </div>
      {showForgotModal && (
        <div className="forgot-overlay"
          onClick={() => {
            setShowForgotModal(false);
            resetForgotForm();
          }}>
          <div className="forgot-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Forgot Password</h2>

            <input
              type="email"
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />

            {forgotMessage && (
              <p className="forgot-message">{forgotMessage}</p>
            )}

            <div className="forgot-buttons">
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  resetForgotForm();
                }}
                className="cancel-button"
              >
                Cancel
              </button>

              <button onClick={handleForgotPassword} disabled={forgotLoading}>
                {forgotLoading ? "Sending..." : "Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginPage;