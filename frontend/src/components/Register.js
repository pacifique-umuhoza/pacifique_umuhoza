import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

export default function Register({ onRegisterSuccess, switchToLogin }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState('Standard');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        full_name: fullName,
        email,
        password,
        plan,
      });
      onRegisterSuccess(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="dot blue"></span>
          <span className="dot green"></span>
          <span className="dot orange"></span>
        </div>
        <h2>Create Account</h2>
        <p className="auth-sub">Register to manage your E-Commerce Store</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Parker Whitson"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="parker@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Select Plan</label>
            <select value={plan} onChange={(e) => setPlan(e.target.value)}>
              <option value="Standard">Standard Plan</option>
              <option value="Pro">Pro Plan</option>
              <option value="Enterprise">Enterprise Plan</option>
            </select>
          </div>
          <button type="submit" className="btn-green full-width">
            Create Account & Enter UI
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <span onClick={switchToLogin}>Sign In</span>
        </p>
      </div>
    </div>
  );
}