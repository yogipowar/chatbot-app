import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "./Leads.css"

const Leads = () => {
    const navigate = useNavigate();

    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const fetchLeads = async () => {
        const adminId = localStorage.getItem("adminId");

        if (!adminId) {
            setError("Admin ID not found.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(
                "https://chatbotapi.scrollosoft.com/users/get-leads",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        adminId: Number(adminId),
                    }),
                }
            );

            const result = await response.json();

            if (result?.status) {
                setLeads(result.data || []);
            } else {
                setError(result?.message || "Failed to fetch leads.");
            }
        } catch (err) {
            console.error("Fetch leads error:", err);
            setError("Something went wrong while fetching leads.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const filteredLeads = useMemo(() => {
        const uniqueLeads = new Map();

        leads.forEach((lead) => {
            const email = String(lead.email || "").trim().toLowerCase();

            if (!email) return;

            const existingLead = uniqueLeads.get(email);

            if (!existingLead) {
                uniqueLeads.set(email, lead);
                return;
            }

            const currentDate = new Date(lead.createdAt || lead.created_at || 0);
            const existingDate = new Date(
                existingLead.createdAt || existingLead.created_at || 0
            );

            if (currentDate > existingDate) {
                uniqueLeads.set(email, lead);
            }
        });

        return Array.from(uniqueLeads.values()).filter((lead) =>
            String(lead.email || "")
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [leads, search]);


    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });
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
                <div className="leads-header">
                    <h1>Leads</h1>

                    <input
                        type="text"
                        className="leads-search"
                        placeholder="Search by email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="leads-table-card">
                    <table className="leads-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>EMAIL</th>
                                <th>CREATED</th>
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="3" className="table-message">
                                        Loading leads...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="3" className="table-message error-text">
                                        {error}
                                    </td>
                                </tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="table-message">
                                        No leads found.
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead, index) => (
                                    <tr key={lead.id || index}>
                                        <td>{lead.id || index + 1}</td>
                                        <td>{lead.email || "-"}</td>
                                        <td>{formatDate(lead.createdAt || lead.created_at)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Leads;
