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
              Human Chat
            </a>
          </li>
        )}
      </ul>

      <div className="sidebar-bottom">
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;