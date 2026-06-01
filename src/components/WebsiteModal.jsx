import React, { useState, useEffect } from "react";

const WebsiteModal = ({ userId, onClose }) => {
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!websiteUrl.trim()) return;

        setLoading(true);

        try {
            const res = await fetch(
                "https://chatbotapi.scrollosoft.com/api/crawl-data",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        domain: websiteUrl,
                        userId: userId,
                    }),
                }
            );

            const data = await res.json();

            if (data.status) {
                setMessage("Website crawling started successfully.");
            } else {
                setMessage(data.message || "Failed to start crawling.");
            }
        } catch (error) {
            setMessage("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3>Account Successfully Created 🎉</h3>
                    <p>
                        Enter your website URL to train your chatbot.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Website URL</label>

                        <input
                            type="url"
                            placeholder="https://yourwebsite.com"
                            value={websiteUrl}
                            onChange={(e) =>
                                setWebsiteUrl(e.target.value)
                            }
                            required
                        />
                    </div>

                    {message && (
                        <div className="modal-success">
                            {message}
                        </div>
                    )}

                    <div className="modal-actions">
                        <button
                            type="submit"
                            className="modal-submit-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Starting Crawl..."
                                : "Submit Website"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WebsiteModal;