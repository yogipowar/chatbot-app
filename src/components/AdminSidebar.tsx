import { useNavigate, useLocation } from "react-router-dom";

const AdminSidebar = ({ onLogout }: { onLogout: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">Admin Panel</div>

      <ul className="sidebar-nav">
        <li>
          <a
            className={location.pathname === "/admin" ? "active" : ""}
            onClick={() => navigate("/admin")}
          >
            Admin Registration
          </a>
        </li>

        <li>
          <a
            className={location.pathname === "/human-chat" ? "active" : ""}
            onClick={() => navigate(`/human-chat?websiteId=${localStorage.getItem("websiteId")}`)}
          >
            Human Chat
          </a>
        </li>
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