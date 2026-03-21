import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../components/socket";
import "./login.css";

const STATIC_EMAIL = "admin@admin.com";
const STATIC_PASSWORD = "admin123";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Admin Login</h1>
        <p className="subtitle">Sign in to your admin panel</p>

        {error && (
          <div style={{ color: "red", marginBottom: "10px" }}>
            {error}
          </div>
        )}

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

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;