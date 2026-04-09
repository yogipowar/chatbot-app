import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";
import AdminSidebar from "./AdminSidebar";

interface User {
  id: number;
  username: string;
  pdfUrl: string;
  sitemapUrl: string;
  subscription_status: string;
  createdAt: string;
}

const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // ✅ Search
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");

    // ✅ Role 2 → always go to Human Chat
    // if (role === "2") {
    //   navigate(
    //     `/human-chat?websiteId=${localStorage.getItem("websiteId")}`,
    //     { replace: true }
    //   );
    // }

    if (role === "2") {
      navigate(
        `/dashboard`,
        { replace: true }
      );
    }

    // ✅ Role 1 → stay on admin
    if (role === "1") {
      navigate("/admin", { replace: true });
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

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
        setCurrentPage(1);
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


  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ✅ Filter users (SEARCH)
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(
    indexOfFirstUser,
    indexOfLastUser
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

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
          {/* ✅ Search */}
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by username..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {loading ? (
            <div className="loading-text">Loading...</div>
          ) : error ? (
            <div className="error-text">{error}</div>
          ) : (
            <>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Resource</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>

                <tbody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
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

                        <td>{user.subscription_status}</td>
                        <td>{formatDate(user.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center" }}>
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* ✅ Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => prev - 1)
                    }
                  >
                    Prev
                  </button>

                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      className={
                        currentPage === index + 1
                          ? "active-page"
                          : ""
                      }
                      onClick={() =>
                        setCurrentPage(index + 1)
                      }
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => prev + 1)
                    }
                  >
                    Next
                  </button>
                </div>
              )}
            </>
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

const AddAdminModal = ({
  onClose,
  onSuccess,
}: AddAdminModalProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [resourceType, setResourceType] =
    useState<"pdf" | "sitemap">("pdf");

  const [sitemapValue, setSitemapValue] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleResourceChange = (
    type: "pdf" | "sitemap"
  ) => {
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
        <h3>Setup Elite Bot</h3>
        <p>Initialize your AI agent with your business data.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Business Email</label>

            <input
              type="email"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
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
                  onChange={() =>
                    handleResourceChange("pdf")
                  }
                />
                Upload PDF
              </label>

              <label>
                <input
                  type="radio"
                  checked={resourceType === "sitemap"}
                  onChange={() =>
                    handleResourceChange("sitemap")
                  }
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
                    setPdfFile(
                      e.target.files?.[0] || null
                    )
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