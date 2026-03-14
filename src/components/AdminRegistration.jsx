import React, { useState } from 'react';
import "./AdminPanel.css";

const AdminRegistration = () => {
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '', password: '', type: 'pdf', file: null, url: '', role: 'admin'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setAdmins([...admins, { ...formData, id: Date.now() }]);
    setShowModal(false);
    // Reset form
    setFormData({ email: '', password: '', type: 'pdf', file: null, url: '', role: 'admin' });
  };

  return (
    <div className="registration-container">
      <div className="header-row">
        <h2>Admin Registration</h2>
        <button className="add-btn" onClick={() => setShowModal(true)}>+ Add Admin</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Resource Type</th>
            <th>Value/Link</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((item) => (
            <tr key={item.id}>
              <td>{item.email}</td>
              <td>{item.role}</td>
              <td>{item.type.toUpperCase()}</td>
              <td>{item.type === 'pdf' ? (item.file ? item.file.name : 'No file') : item.url}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Register New Admin</h3>
            <form onSubmit={handleSubmit}>
              <input 
                type="email" placeholder="Email" required 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
              <input 
                type="password" placeholder="Password" required 
                onChange={e => setFormData({...formData, password: e.target.value})} 
              />
              
              <label>Upload Choice:</label>
              <select onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="pdf">PDF File</option>
                <option value="url">Website URL</option>
              </select>

              {formData.type === 'pdf' ? (
                <input type="file" accept=".pdf" required 
                  onChange={e => setFormData({...formData, file: e.target.files[0]})} />
              ) : (
                <input type="url" placeholder="https://scrollosoft.com" required 
                  onChange={e => setFormData({...formData, url: e.target.value})} />
              )}

              <label>Status:</label>
              <select onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="admin">Admin</option>
                <option value="disabled">Disabled</option>
              </select>

              <div className="modal-btns">
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegistration;