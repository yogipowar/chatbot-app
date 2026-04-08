import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { useNavigate } from "react-router-dom";
import "./Invoice.css";

const Invoice = () => {
    const navigate = useNavigate();

    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subscriptionId, setSubscriptionId] = useState(null);

    // ✅ STEP 1: Get User Details
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

            if (data.status && data.user?.subscription_id) {
                setSubscriptionId(data.user.subscription_id);
                fetchInvoices(data.user.subscription_id);
            } else {
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    // ✅ STEP 2: Fetch Invoices
    const fetchInvoices = async (subId) => {
        try {
            const res = await fetch(
                "https://chatbotapi.scrollosoft.com/users/get-invoices",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        subscription_id: subId,
                    }),
                }
            );

            const data = await res.json();

            if (data.status && data.data?.items) {
                setInvoices(data.data.items);
            } else {
                setInvoices([]);
            }
        } catch (err) {
            console.error(err);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchUserDetails();
    }, []);

    // ✅ Format date
    const formatDate = (timestamp) => {
        if (!timestamp) return "-";
        return new Date(timestamp * 1000).toLocaleDateString();
    };

    return (
        <div className="dashboard-layout">
            <AdminSidebar
                onLogout={() => {
                    localStorage.removeItem("isLoggedIn");
                    navigate("/login");
                }}
            />

            <div className="invoice-container">
                {/* <h1>Invoices</h1> */}

                {loading ? (
                    <p>Loading invoices...</p>
                ) : invoices.length === 0 ? (
                    <p>No invoices found</p>
                ) : (
                    <div className="invoice-table-wrapper">
                        <table className="invoice-table">
                            <thead>
                                <tr>
                                    <th>Invoice ID</th>
                                    <th>Email</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Plan</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {invoices.map((inv) => (
                                    <tr key={inv.id}>
                                        <td>{inv.id}</td>

                                        <td>
                                            {inv.customer_details?.email ||
                                                inv.customer_details?.customer_email ||
                                                "-"}
                                        </td>

                                        <td>
                                            ₹{(inv.amount_paid || inv.amount || 0) / 100}
                                        </td>

                                        <td>
                                            <span className={`status ${inv.status}`}>
                                                {inv.status}
                                            </span>
                                        </td>

                                        <td>{formatDate(inv.created_at)}</td>

                                        <td>
                                            {inv.line_items?.[0]?.name || "Plan"}
                                        </td>

                                        <td>
                                            {inv.short_url ? (
                                                <a
                                                    href={inv.short_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="view-btn"
                                                >
                                                    View
                                                </a>
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Invoice;