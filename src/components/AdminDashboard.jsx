import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import AdminRegistration from './AdminRegistration';
import "./AdminPanel.css";

const AdminDashboard = ({ role }) => {
  const location = useLocation();

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>Scrollosoft</h2>
          <span>{role.toUpperCase()}</span>
        </div>
        <nav>
          <ul>
            <li className={location.pathname.includes('registration') ? 'active' : ''}>
              <Link to="/admin/registration">Admin Registration</Link>
            </li>
            {/* You can add more <li> <Link> items here in the future */}
          </ul>
        </nav>
      </aside>

      <main className="admin-content">
        <Routes>
          <Route path="registration" element={<AdminRegistration />} />
          {/* Future menus: <Route path="analytics" element={<Analytics />} /> */}
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;