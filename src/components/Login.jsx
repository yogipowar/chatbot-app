import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./login.css";

const Login = ({ setAuth }) => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    let role = '';
    
    if (password === '1') role = 'superadmin';
    else if (password === '2') role = 'admin';

    if (role) {
      setAuth({ isLoggedIn: true, role });
      navigate('/admin/registration'); 
    } else {
      alert("Invalid Credentials. Use '1' or '2'.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <h2>Scrollosoft Admin</h2>
        <input type="email" placeholder="Email ID" required />
        <input 
          type="password" 
          placeholder="Password (1 or 2)" 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;