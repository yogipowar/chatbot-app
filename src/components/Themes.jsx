import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./OwnerAccount.css";

const Themes = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        primaryColor: "#009DE1",
        secondaryColor: "#0488c1",
        chatPosition: "right",
        isActive: "1",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

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
                    primaryColor: data.user.primaryColor || "#009DE1",
                    secondaryColor: data.user.secondaryColor || "#0488c1",
                    chatPosition: data.user.chatPosition || "right",
                    isActive: String(data.user.isActive ?? 1),
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, []);

    // ✅ Input change
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ✅ Update API
    const handleUpdate = async () => {
        setLoading(true);

        try {
            const form = new FormData();

            form.append("primaryColor", formData.primaryColor);
            form.append("secondaryColor", formData.secondaryColor);
            form.append("chatPosition", formData.chatPosition);
            form.append("isActive", formData.isActive);

            const res = await fetch(
                `https://chatbotapi.scrollosoft.com/users/update-user-files/${user.id}`,
                {
                    method: "POST",
                    body: form,
                }
            );

            const data = await res.json();

            if (data.status) {
                toast.success("Theme updated successfully");
                setIsEditing(false);
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
                        {/* Primary Color */}
                        <div className="form-group">
                            <label>Primary Color</label>
                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                <p>{formData.primaryColor}</p>
                                <input
                                    type="color"
                                    name="primaryColor"
                                    value={formData.primaryColor}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>

                        {/* Secondary Color */}
                        <div className="form-group">
                            <label>Secondary Color</label>
                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                <p>{formData.secondaryColor}</p>
                                <input
                                    type="color"
                                    name="secondaryColor"
                                    value={formData.secondaryColor}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Chat Position */}
                    <div className="form-group">
                        <label>Chat Position</label>

                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    name="chatPosition"
                                    value="left"
                                    checked={formData.chatPosition === "left"}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                                Left
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="chatPosition"
                                    value="right"
                                    checked={formData.chatPosition === "right"}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                                Right
                            </label>
                        </div>
                    </div>

                    {/* Visibility Status */}
                    <div className="form-group">
                        <label>Visibility Status</label>

                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    name="isActive"
                                    value="1"
                                    checked={formData.isActive === "1"}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                                Active
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="isActive"
                                    value="0"
                                    checked={formData.isActive === "0"}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                                Inactive
                            </label>
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
        </div>
    );
};

export default Themes;