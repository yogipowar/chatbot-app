import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { useNavigate } from "react-router-dom";
import SubscriptionModal from "./SubscriptionModal";
import "./OwnerDashboard.css";
import TrialExpiredModal from "./TrialExpiredModal";
import Image from "../assets/3starts.png"

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
                <div className="chat-header">
                    <h4>Dashboard </h4>
                    {user?.subscription_status === "active" ? (
                        ""
                    ) : (
                        <button className="close-btn">
                            Upgrade Plan
                        </button>
                    )}
                </div>
                <div className="dashboard-inner-content">
                    <div className="top-section">

                        {/* LEFT - Welcome */}
                        <div className="welcome-card">
                            <span className="welcome-badge">
                                {user?.subscription_status === "active"
                                    ? "SUBSCRIPTION ACTIVE"
                                    : "NEW ACCOUNT ACTIVATION"}
                            </span>

                            <h2>
                                {user?.subscription_status === "active"
                                    ? "🎉 Your subscription is active!"
                                    : "Welcome! Your 7-day free trial started"}
                            </h2>

                            <p>
                                {user?.subscription_status === "active"
                                    ? "You now have full access to all premium features. Start automating and scaling your customer interactions."
                                    : "We're excited to help you automate your customer interactions with our next-gen AI agent system."}
                            </p>

                            {user?.subscription_status === "active" ?
                                ("") : (
                                    <button className="view-btn">

                                        View Plans
                                    </button>
                                )}

                            <img className="startimg" src={Image} alt="" />
                        </div>

                        {/* RIGHT - Trial / Active */}
                        <div className="trial-card">

                            {user?.subscription_status === "active" ? (
                                <>
                                    <div className="trial-circle active-circle">
                                        <div className="inner-circle">
                                            ✔
                                            <span>ACTIVE</span>
                                        </div>
                                    </div>

                                    <h3>Subscription Active</h3>

                                    <p>
                                        Your plan is active. Enjoy uninterrupted access to all features.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div
                                        className="trial-circle"
                                        style={{
                                            background: `conic-gradient(#0ea5e9 ${(remainingDays / 7) * 100}%, #e5e7eb 0%)`
                                        }}
                                    >
                                        <div className="inner-circle">
                                            {remainingDays}
                                            <span>DAYS LEFT</span>
                                        </div>
                                    </div>

                                    <h3>Trial Countdown</h3>

                                    <p>
                                        We're helping you engage customers better and respond instantly
                                        with your AI chatbot.
                                    </p>
                                </>
                            )}

                        </div>

                    </div>

                    <div className="admin-card">
                        <h3>Admin Details</h3>

                        <div className="admin-inner-card">
                            <div className="admin-info">

                                <div className="admin-block">
                                    <span>ADMIN ID</span>
                                    <strong>#{user?.id}</strong>
                                </div>

                                <div className="admin-block">
                                    <span>EMAIL</span>
                                    <strong>{user?.username}</strong>
                                </div>

                                <div className="admin-block">
                                    <span>ACCOUNT STATUS</span>
                                    <strong className="status-active">● Active</strong>
                                </div>



                            </div>
                            <div className="admin-block">
                                <span>SUBSCRIPTION</span>
                                <strong className="subscription">7-Day Free Trial</strong>
                            </div>
                        </div>
                    </div>
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