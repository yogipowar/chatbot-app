import React, { useState } from "react";
import { Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "./Integration.css";
import { toast } from "react-toastify";

const Integration = () => {
  const navigate = useNavigate();
  const adminId = localStorage.getItem("adminId") || "";

  const [activeTab, setActiveTab] = useState("general");

  const scriptCode = `<script>window.chatbotConfig = {websiteId: "${adminId}"};</script>
<script src="https://wcchatbot.com/chatbot-loader.js"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    toast.success("Copied to clipboard");
  };

  // ✅ Instructions Renderer
  const renderInstructions = () => {
    switch (activeTab) {
      case "wordpress":
        return (
          <>
            <h3>🧩 WordPress Installation</h3>
            <ol>
              <li>Login to your WordPress dashboard</li>
              <li>Go to <b>Appearance → Theme File Editor</b></li>
              <li>Open <b>footer.php</b></li>
              <li>Paste the code before <b>&lt;/body&gt;</b></li>
              <li>Click <b>Update File</b></li>
            </ol>
          </>
        );

      case "shopify":
        return (
          <>
            <h3>🛒 Shopify Installation</h3>
            <ol>
              <li>Go to <b>Online Store → Themes</b></li>
              <li>Click <b>Actions → Edit Code</b></li>
              <li>Open <b>theme.liquid</b></li>
              <li>Paste code before <b>&lt;/body&gt;</b></li>
              <li>Click <b>Save</b></li>
            </ol>
          </>
        );

      case "wix":
        return (
          <>
            <h3>✨ Wix Installation</h3>
            <ol>
              <li>Open Wix Editor</li>
              <li>Go to <b>Settings</b></li>
              <li>Click <b>Custom Code</b></li>
              <li>Add new code</li>
              <li>Paste embed code</li>
              <li>Select <b>All Pages</b></li>
              <li>Set position to <b>Body End</b></li>
            </ol>
          </>
        );

      case "webflow":
        return (
          <>
            <h3>🌊 Webflow Installation</h3>
            <ol>
              <li>Open your project</li>
              <li>Go to <b>Project Settings</b></li>
              <li>Open <b>Custom Code</b></li>
              <li>Paste code in <b>Footer</b></li>
              <li>Publish your site</li>
            </ol>
          </>
        );

      case "custom":
        return (
          <>
            <h3>💻 Custom HTML Installation</h3>
            <ol>
              <li>Open your HTML file</li>
              <li>Paste the script before <b>&lt;/body&gt;</b></li>
              <li>Save and upload to server</li>
            </ol>
          </>
        );

      default:
        return (
          <>
            <h3>🌐 General Installation</h3>
            <ol>
              <li>Copy the embed code</li>
              <li>Open your website HTML or CMS</li>
              <li>Paste before <b>&lt;/body&gt;</b></li>
              <li>Save and publish</li>
            </ol>

            <div className="tip-box">
              💡 Tip: You can use platform-specific tabs above for detailed steps.
            </div>
          </>
        );
    }
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
          <h2>Platform-Specific Instructions</h2>
          <p className="subtitle">
            Choose your platform for detailed installation steps
          </p>

          {/* ✅ Tabs */}
          <div className="platform-tabs">
            {[
              { key: "general", label: "General" },
              { key: "wordpress", label: "WordPress" },
              { key: "shopify", label: "Shopify" },
              { key: "wix", label: "Wix" },
              { key: "webflow", label: "Webflow" },
              { key: "custom", label: "Custom HTML" },
            ].map((tab) => (
              <button
                key={tab.key}
                className={activeTab === tab.key ? "active" : ""}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ✅ Instructions */}
          <div className="instruction-box">{renderInstructions()}</div>

          {/* ✅ Script Copy Section */}
          <div className="code-section">
            <div className="code-header">
              <span>Embed Code</span>
              <Copy size={18} onClick={handleCopy} className="copy-icon" />
            </div>

            <pre>{scriptCode}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integration;