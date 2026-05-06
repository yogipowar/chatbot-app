import { CodeXml, LayoutGrid, LocateFixed, LogOut, MessageCircle, Palette, ReceiptText, UserRound } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AdminSidebar = ({ onLogout }: { onLogout: () => void }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("role");

  return (
    <>
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <img className="sidebar-logo-img" src="/logo-sec.png" alt="" />
        </div>

        <ul className="sidebar-nav">

          {/* ✅ Role 1 → Admin Registration */}
          {role === "1" && (
            <li>
              <a
                className={location.pathname === "/admin" ? "active" : ""}
                onClick={() => navigate("/admin")}
              >
                Admin Registration
              </a>
            </li>
          )}

          {/* ✅ Role 2 → Human Chat */}
          {role === "2" && (
            <>
              {/* ✅ Dashboard */}
              <li>
                <a
                  className={
                    location.pathname === "/dashboard" || location.pathname === "/"
                      ? "active"
                      : ""
                  }
                  onClick={() => navigate("/dashboard")}
                >
                  <LayoutGrid />  Dashboard
                </a>
              </li>



              {/* ✅ Human Chat */}
              <li>
                <a
                  className={
                    location.pathname.includes("/human-chat") ? "active" : ""
                  }
                  onClick={() =>
                    navigate(
                      `/human-chat?websiteId=${localStorage.getItem("websiteId")}`
                    )
                  }
                >
                  <MessageCircle /> Human Chat
                </a>
              </li>

              <li>
                <a
                  className={
                    location.pathname === "/my-account" ? "active" : ""
                  }
                  onClick={() => navigate("/my-account")}
                >
                  <UserRound /> My Account
                </a>
              </li>

              <li>
                <a
                  className={
                    location.pathname === "/themes" ? "active" : ""
                  }
                  onClick={() => navigate("/themes")}
                >
                  <Palette /> Themes
                </a>
              </li>

              <li>
                <a
                  className={
                    location.pathname === "/invoice" ? "active" : ""
                  }
                  onClick={() => navigate("/invoice")}
                >
                  <ReceiptText /> Invoice
                </a>
              </li>

              <li>
                <a
                  className={
                    location.pathname === "/integration" ? "active" : ""
                  }
                  onClick={() => navigate("/integration")}
                >
                  <CodeXml /> Integration
                </a>
              </li>

              <li>
                <a
                  className={
                    location.pathname === "/leads" || location.pathname === "/"
                      ? "active"
                      : ""
                  }
                  onClick={() => navigate("/leads")}
                >
                  <LocateFixed />  Leads
                </a>
              </li>

            </>
          )}
        </ul>

        <div className="sidebar-bottom">
          <button
            className="logout-btn"
            onClick={() => setShowLogoutModal(true)}
          >
            <LogOut /> Logout
          </button>
        </div>
      </aside>

      {
        showLogoutModal && (
          <div className="logout-modal-overlay">
            <div className="logout-modal">
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to logout?</p>

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="confirm-btn"
                  onClick={() => {
                    setShowLogoutModal(false);
                    onLogout(); // ✅ your existing function
                  }}
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
};

export default AdminSidebar;