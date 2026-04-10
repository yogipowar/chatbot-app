import React from "react";
import { Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "./Integration.css";
import { toast } from "react-toastify";

const Integration = () => {
    const navigate = useNavigate();
    const adminId = localStorage.getItem("adminId") || "";

    const scriptCode = `<script>window.chatbotConfig = {websiteId: "${adminId}"};</script>
<script src="https://wcchatbot.com/chatbot-loader.js"></script>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(scriptCode);
        toast.success("Copied to clipboard"); // you can replace with toast
    };

    return (
        <div className="dashboard-layout">
            <AdminSidebar
                onLogout={() => {
                    localStorage.removeItem("isLoggedIn");
                    navigate("/login");
                }}
            />

            <div className="account-container">
                <div className="integration-container">
                    <p style={{ marginBottom: "10px" }}>
                        Copy this code and paste it into your website footer before closing{" "}
                        <b>&lt;/body&gt;</b> tag.
                    </p>

                    <div className="code-section">
                        <Copy className="copy-icon"
                            size={18}
                            onClick={handleCopy}
                        />

                        {scriptCode}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Integration;