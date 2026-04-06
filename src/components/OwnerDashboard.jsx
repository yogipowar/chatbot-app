import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { useNavigate } from "react-router-dom";
import SubscriptionModal from "./SubscriptionModal";
import "./OwnerDashboard.css";
import TrialExpiredModal from "./TrialExpiredModal";

const OwnerDashboard = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [remainingDays, setRemainingDays] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [showTrialExpired, setShowTrialExpired] = useState(false);

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
                console.log("user details", data.user.subscription_status);
                // localStorage.setItem("subscription_status", data.user.subscription_status);
                // localStorage.setItem("createdAt", data.user.createdAt);

                calculateTrialDays(data.user.createdAt, data.user.subscription_status);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const calculateTrialDays = (createdAt, subscription_status) => {
        const createdDate = new Date(createdAt).getTime();
        const currentDate = new Date().getTime();

        console.log("created date", createdDate, "current date", currentDate, "status", subscription_status);

        const diffDays = Math.floor(
            (currentDate - createdDate) / (1000 * 60 * 60 * 24)
        );

        const remaining = 7 - diffDays;

        setRemainingDays(remaining > 0 ? remaining : 0);

        // ✅ NEW CONDITION
        if (
            user?.subscription_status === "inactive" &&
            remainingDays <= 0
        ) {
            console.log("11111111111");
            setShowTrialExpired(true);
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, []);

    return (
        <div className="dashboard-layout">
            <AdminSidebar
                onLogout={() => {
                    localStorage.removeItem("isLoggedIn");
                    navigate("/");
                }}
            />

            <div className="dashboard-content">

                <div className="dashboard-header">
                    <h1>Dashboard</h1>
                    <p>Welcome back! Here's your account overview</p>
                </div>

                <div className="dashboard-grid">

                    {/* Admin Details */}
                    <div className="card">
                        <h3>Admin Details</h3>
                        <p><strong>ID:</strong> {user?.id}</p>
                        <p><strong>Email:</strong> {user?.username}</p>
                        <p>
                            <strong>Status:</strong>
                            <span className={`status ${user?.subscription_status}`}>
                                {user?.subscription_status}
                            </span>
                        </p>
                    </div>

                    {/* Trial / Subscription */}
                    {user?.subscription_status !== "active" ? (
                        <div className="card">
                            <h3>Free Trial</h3>

                            {remainingDays > 0 ? (
                                <>
                                    <p className="trial-text">
                                        ⏳ {remainingDays} days remaining
                                    </p>

                                    <button
                                        className="primary-btn"
                                        onClick={() => setShowModal(true)}
                                    >
                                        Upgrade Plan
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="expired-text">
                                        ❌ Trial expired
                                    </p>

                                    <button
                                        className="primary-btn"
                                        onClick={() => setShowModal(true)}
                                    >
                                        Subscribe Now
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="card success">
                            <h3>Subscription</h3>
                            <p>🎉 Your subscription is active</p>
                        </div>
                    )}

                </div>
            </div>

            {showModal && (
                <SubscriptionModal
                    onClose={(isSuccess) => {
                        setShowModal(false);

                        if (isSuccess) {
                            // 🔥 REFRESH DATA AFTER PAYMENT
                            fetchUserDetails();
                            return; // stop further logic
                        }

                        // 🔁 only for manual close
                        if (
                            user?.subscription_status === "inactive" &&
                            remainingDays <= 0
                        ) {
                            setShowTrialExpired(true);
                        }
                    }}
                />
            )}
            {showTrialExpired && (
                <TrialExpiredModal
                    onUpgrade={() => {
                        setShowTrialExpired(false);
                        setShowModal(true); // open subscription modal
                    }}
                />
            )}
        </div>
    );
};

export default OwnerDashboard;