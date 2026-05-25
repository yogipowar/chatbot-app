import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { crawlSite } from "../api/crawlApi";
import { generateCrawlPdf } from "../utils/generatePdf";
import "./OwnerAccount.css";

const OwnerAccount = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        username: "",
        sitemapUrl: "",
    });

    const [pdfFile, setPdfFile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [resourceType, setResourceType] = useState("sitemap");

    const [url, setUrl] = useState("");
    const [maxPages, setMaxPages] = useState(1000);

    const [loadingCrawl, setLoadingCrawl] = useState(false);
    const [crawlError, setCrawlError] = useState("");
    const [generatedPdf, setGeneratedPdf] = useState(null);

    const [loadingMessage, setLoadingMessage] = useState("");
    const [showCrawlerDialog, setShowCrawlerDialog] = useState(false);


    // ✅ Fetch User
    const fetchUserDetails = async () => {
        try {
            const userId = localStorage.getItem("adminId");

            const res = await fetch(
                "https://chatbotapi.scrollosoft.com/users/get-details",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: Number(userId) }),
                }
            );

            const data = await res.json();

            if (data.status) {
                setUser(data.user);

                setFormData({
                    username: data.user.username || "",
                    sitemapUrl: data.user.sitemapUrl || "",
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, []);

    async function crawlhandleSubmit() {
        if (!url.trim()) return;

        setLoadingCrawl(true);
        setCrawlError("");
        setShowCrawlerDialog(true);

        try {
            setLoadingMessage("Fetching website pages...");

            const data = await crawlSite(url, {
                maxPages: Number(maxPages),
            });

            setLoadingMessage("Extracting content...");

            await new Promise((resolve) => setTimeout(resolve, 1000));

            setLoadingMessage("Generating PDF...");

            const pdfBlob = await generateCrawlPdf(data);

            const pdfUrl = URL.createObjectURL(pdfBlob);

            setGeneratedPdf(pdfUrl);

            setLoadingMessage("PDF generated successfully");

            setTimeout(() => {
                setShowCrawlerDialog(false);
            }, 1500);

        } catch (err) {
            console.error(err);

            setCrawlError(err.message || "Failed to crawl website");

            setLoadingMessage("Something went wrong");

            setTimeout(() => {
                setShowCrawlerDialog(false);
            }, 1500);
        }

        setLoadingCrawl(false);
    }

    // ✅ Input change
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ✅ PDF change
    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (file.type !== "application/pdf") {
            alert("Only PDF file allowed");
            return;
        }

        setPdfFile(file);
    };

    // ✅ Update API
    const handleUpdate = async () => {
        setLoading(true);

        try {
            const form = new FormData();

            form.append("username", formData.username);

            if (formData.sitemapUrl) {
                form.append("sitemapUrl", formData.sitemapUrl);
            }

            if (resourceType === "website") {

                if (!generatedPdf) {
                    alert("Please generate PDF first");
                    setLoading(false);
                    return;
                }

                const response = await fetch(generatedPdf);

                const blob = await response.blob();

                const file = new File(
                    [blob],
                    "website-content.pdf",
                    {
                        type: "application/pdf",
                    }
                );

                form.append("uploaded_file", file);

            } else if (pdfFile) {

                form.append("uploaded_file", pdfFile);
            }

            const res = await fetch(
                `https://chatbotapi.scrollosoft.com/users/update-user-files/${user.id}`,
                {
                    method: "POST",
                    body: form,
                }
            );

            const data = await res.json();

            if (data.status) {
                toast.success("Profile updated successfully");

                setIsEditing(false);
                setPdfFile(null);
                fetchUserDetails();
            } else {
                alert(data.message || "Update failed");
            }
        } catch (err) {
            console.error(err);
            alert("Update failed");
        }

        setLoading(false);
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
                <div className="account-card">

                    <div className="form-flex">
                        {/* Email */}
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                disabled
                            />
                        </div>

                        {/* Sitemap */}
                        <div className="form-group">

                            {resourceType === "sitemap" && (
                                <>
                                    <label>Sitemap URL</label>

                                    <input
                                        type="text"
                                        name="sitemapUrl"
                                        value={formData.sitemapUrl}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </>
                            )}

                            {resourceType === "pdf" && (
                                <>
                                    <label>Upload PDF</label>

                                    {isEditing ? (
                                        <>
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleFileChange}
                                            />

                                            {pdfFile && (
                                                <p className="file-name">
                                                    Selected: {pdfFile.name}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="file-name">
                                            {user?.pdfUrl || "No PDF uploaded"}
                                        </p>
                                    )}
                                </>
                            )}

                            {resourceType === "website" && isEditing && (
                                <div className="website-crawl-section">

                                    <label>Website URL</label>

                                    <div className="url-row">
                                        <input
                                            type="url"
                                            placeholder="https://example.com"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                        />

                                        <button
                                            type="button"
                                            onClick={crawlhandleSubmit}
                                            disabled={loadingCrawl}
                                        >
                                            {loadingCrawl ? "Generating..." : "Generate PDF"}
                                        </button>
                                    </div>

                                    <div className="options">
                                        <label>Max Pages</label>

                                        <input
                                            type="number"
                                            min={1}
                                            max={1000}
                                            value={maxPages}
                                            onChange={(e) => setMaxPages(e.target.value)}
                                        />
                                    </div>

                                    {generatedPdf && (
                                        <div className="generated-pdf-preview">

                                            <iframe
                                                src={generatedPdf}
                                                title="Generated PDF"
                                                width="100%"
                                                height="400px"
                                            />

                                            <a
                                                href={generatedPdf}
                                                download="website-content.pdf"
                                                className="download-btn"
                                            >
                                                Download PDF
                                            </a>
                                        </div>
                                    )}

                                    {crawlError && (
                                        <p className="error-text">
                                            {crawlError}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-flex">
                        {/* PDF Upload */}
                        <div className="form-group">
                            <label>Upload PDF</label>

                            {isEditing ? (
                                <>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                    />
                                    {pdfFile && (
                                        <p className="file-name">
                                            Selected: {pdfFile.name}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <p className="file-name">
                                    {user?.pdfUrl || "No PDF uploaded"}
                                </p>
                            )}
                        </div>

                        {/* Subscription */}
                        <div className="form-group">
                            <label>Subscription Status</label>
                            <input
                                type="text"
                                value={user?.subscription_status || ""}
                                disabled
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="button-group">
                        {!isEditing ? (
                            <button
                                className="edit-btn"
                                onClick={() => setIsEditing(true)}
                            >
                                Edit
                            </button>
                        ) : (
                            <>
                                <button
                                    className="save-btn"
                                    onClick={handleUpdate}
                                    disabled={loading}
                                >
                                    {loading ? "Updating..." : "Update"}
                                </button>

                                <button
                                    className="cancel-btn"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setPdfFile(null);
                                        fetchUserDetails();
                                    }}
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>

                </div>
            </div>
            {showCrawlerDialog && (
                <div className="crawler-dialog-overlay">
                    <div className="crawler-dialog">

                        <div className="loader"></div>

                        <h3>{loadingMessage}</h3>

                        <p>
                            Please wait while we crawl the website and prepare your PDF.
                        </p>

                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerAccount;