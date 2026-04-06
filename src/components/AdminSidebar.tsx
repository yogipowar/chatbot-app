import { LayoutGrid, LogOut, MessageCircle, UserRound } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const AdminSidebar = ({ onLogout }: { onLogout: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("role");

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">Admin Panel</div>

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
          </>
        )}
      </ul>

      <div className="sidebar-bottom">
        <button className="logout-btn" onClick={onLogout}>
          <LogOut /> Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;