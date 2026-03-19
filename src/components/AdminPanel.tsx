import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";
import AdminSidebar from "./AdminSidebar";

interface User {
  id: number;
  username: string;
  pdfUrl: string;
  sitemapUrl: string;
  createdAt: string;
}

const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") !== "true") {
      navigate("/");
    }
  }, [navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "https://chatbotapi.scrollosoft.com/users/registered-users-list"
      );

      const data = await res.json();

      if (data.success) {
        setUsers(data.data);
      } else {
        setError("Failed to fetch users");
      }
    } catch {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="admin-layout">
      <AdminSidebar onLogout={handleLogout} />

      <main className="admin-main">
        <header className="admin-header">
          <h2>Registered Admins</h2>

          <button
            className="add-admin-btn"
            onClick={() => setShowModal(true)}
          >
            + Add Admin
          </button>
        </header>

        <div className="admin-content">
          {loading ? (
            <div className="loading-text">Loading...</div>
          ) : error ? (
            <div className="error-text">{error}</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Resource</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>

                    <td>{user.username}</td>

                    <td>
                      {user.pdfUrl ? (
                        <a
                          className="resource-link"
                          href={user.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          📄 Download PDF
                        </a>
                      ) : user.sitemapUrl ? (
                        <a
                          className="resource-link"
                          href={user.sitemapUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          🌐 Open Sitemap
                        </a>
                      ) : (
                        <span>—</span>
                      )}
                    </td>

                    <td>{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {showModal && (
        <AddAdminModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
};

interface AddAdminModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddAdminModal = ({ onClose, onSuccess }: AddAdminModalProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [resourceType, setResourceType] = useState<"pdf" | "sitemap">("pdf");

  const [sitemapValue, setSitemapValue] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleResourceChange = (type: "pdf" | "sitemap") => {
    setResourceType(type);
    setPdfFile(null);
    setSitemapValue("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    setError("");

    const formData = new FormData();

    formData.append("username", username);
    formData.append("password", password);
    formData.append("role", "2");

    if (resourceType === "pdf") {
      if (!pdfFile) {
        setError("Please upload a PDF file");
        setSubmitting(false);
        return;
      }

      formData.append("uploaded_file", pdfFile);
    }

    if (resourceType === "sitemap") {
      if (!sitemapValue.trim()) {
        setError("Please enter Sitemap URL");
        setSubmitting(false);
        return;
      }

      formData.append("sitemapUrl", sitemapValue);
    }

    try {
      const res = await fetch(
        "https://chatbotapi.scrollosoft.com/users/register",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.status || data.success) {
        onSuccess();
      } else {
        setError(data.message || "Registration failed");
      }
    } catch {
      setError("Failed to register admin");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Add New Admin</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <div className="form-group">
            <label>Resource Type</label>

            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  checked={resourceType === "pdf"}
                  onChange={() => handleResourceChange("pdf")}
                />
                Upload PDF
              </label>

              <label>
                <input
                  type="radio"
                  checked={resourceType === "sitemap"}
                  onChange={() => handleResourceChange("sitemap")}
                />
                Sitemap URL
              </label>
            </div>
          </div>

          <div className="form-group">
            {resourceType === "pdf" ? (
              <>
                <label>PDF File *</label>

                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    setPdfFile(e.target.files?.[0] || null)
                  }
                />

                {pdfFile && (
                  <span className="resource-text">
                    Selected: {pdfFile.name}
                  </span>
                )}
              </>
            ) : (
              <>
                <label>Sitemap URL *</label>

                <input
                  type="text"
                  value={sitemapValue}
                  onChange={(e) =>
                    setSitemapValue(e.target.value)
                  }
                  placeholder="https://example.com/sitemap.xml"
                />
              </>
            )}
          </div>

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="modal-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="modal-submit-btn"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Add Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;