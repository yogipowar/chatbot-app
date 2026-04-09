import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "./SubscriptionModal.css";

const SubscriptionModal = ({ onClose }) => {
    const [planType, setPlanType] = useState("monthly");

    const handleSubscribe = async () => {
        try {
            const userId = localStorage.getItem("adminId");

            const planId =
                planType === "monthly"
                    ? "plan_SZJyer4QbgJ7iG"
                    : "plan_SZJzPSvsov16aJ";

            const res = await fetch(
                "https://chatbotapi.scrollosoft.com/users/create-subscription",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        plan_id: planId,
                        user_id: Number(userId),
                    }),
                }
            );

            const data = await res.json();

            if (!data.status) {
                alert("Subscription creation failed");
                return;
            }

            const subscriptionId = data.subscription.id;

            console.log("✅ Subscription ID:", subscriptionId);

            // ✅ OPEN RAZORPAY CHECKOUT
            openRazorpay(subscriptionId);

        } catch (err) {
            console.error("❌ Subscription Error:", err);
        }
    };

    const openRazorpay = (subscriptionId) => {
        const options = {
            key: "rzp_test_SZJs8LheVmP8lm", 
            subscription_id: subscriptionId,
            name: "wcchatbot",
            description: "Elite Plan Subscription",

            handler: async function (response) {
                console.log("✅ Payment Success:", response);

                setTimeout(() => {
                    verifySubscription();
                }, 2000);
            },

            theme: {
                color: "#6366f1",
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    const verifySubscription = async () => {
        try {
            const userId = localStorage.getItem("adminId");

            const res = await fetch(
                "https://chatbotapi.scrollosoft.com/users/get-details",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id: Number(userId),
                    }),
                }
            );

            const data = await res.json();

            if (data.status) {
                const status = data.user.subscription_status;

                console.log("📌 Subscription Status:", status);

                // ✅ NO localStorage

                if (status === "active") {
                    toast.success("🎉 Subscription Activated Successfully!");

                    // ✅ Close modal
                    onClose(true);
                }
            }
        } catch (err) {
            console.error("❌ Verify Error:", err);
        }
    };

    useEffect(() => {
        verifySubscription();
    }, []);

    return (
        <div className="modal-overlay">
            <div className="subscription-modal">

                {/* Close */}
                <button className="close-btn" onClick={onClose}>✕</button>

                {/* Toggle */}
                <div className="plan-toggle">
                    <button
                        className={planType === "monthly" ? "active" : ""}
                        onClick={() => setPlanType("monthly")}
                    >
                        Monthly
                    </button>

                    <button
                        className={planType === "annual" ? "active" : ""}
                        onClick={() => setPlanType("annual")}
                    >
                        Annual <span className="save-badge">Save 20%</span>
                    </button>
                </div>

                {/* Plans */}
                <div className="plans-container">

                    {/* Elite Plan */}
                    <div className="plan-card popular">
                        <div className="popular-tag">Most Popular</div>

                        <h2>Elite Plan</h2>
                        <p className="desc">
                            Perfect for growing businesses that want powerful AI support.
                        </p>

                        <h1 className="price">
                            ${planType === "monthly" ? "99" : "950"}
                            <span>/{planType === "monthly" ? "month" : "year"}</span>
                        </h1>

                        <ul>
                            <li>✔ Unlimited conversations</li>
                            <li>✔ Advanced AI model access</li>
                            <li>✔ Custom branding</li>
                            <li>✔ Priority support</li>
                            <li>✔ Analytics dashboard</li>
                            <li>✔ API access</li>
                        </ul>

                        <button className="primary-btn" onClick={handleSubscribe}>
                            Get Elite Plan
                        </button>
                    </div>

                    {/* Custom Plan */}
                    <div className="plan-card">
                        <h2>Custom Plan</h2>
                        <p className="desc">
                            Tailored solutions for enterprise needs.
                        </p>

                        <h1 className="price">Custom</h1>

                        <ul>
                            <li>✔ Everything in Elite</li>
                            <li>✔ Dedicated manager</li>
                            <li>✔ SLA 99.99%</li>
                            <li>✔ Advanced security</li>
                            <li>✔ Unlimited team seats</li>
                        </ul>

                        <button className="secondary-btn">Contact Sales</button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SubscriptionModal;