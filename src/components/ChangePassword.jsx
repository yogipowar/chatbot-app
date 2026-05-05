import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./changePassword.css";

const ChangePassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const email = params.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChangePassword = async () => {
    if (!password || !confirmPassword) {
      setMessage("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        "https://chatbotapi.scrollosoft.com/users/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: email,
            newPassword: password,
          }),
        }
      );

      const data = await res.json();

      if (data.status) {
        setIsSuccess(true);
        setMessage("Password updated successfully!");

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setMessage(data.message || "Failed to update password");
      }
    } catch (err) {
      setMessage("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <>
      <div className="cp-container">
        <img className="logo-img" src="./logo-sec.png" alt="" />
        <div className="cp-card">
          <h2>Reset Password</h2>
          <p className="cp-subtext">{email}</p>

          {/* Password */}
          <div className="cp-input-group">
            <label>New Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="cp-input-group">
            <label>Confirm Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPass ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span onClick={() => setShowConfirmPass(!showConfirmPass)}>
                {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          {message && (
            <p className={`cp-message ${isSuccess ? "success" : "error"}`}>
              {message}
            </p>
          )}

          <button onClick={handleChangePassword} disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;