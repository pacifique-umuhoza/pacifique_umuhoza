import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLoginSuccess, switchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      onLoginSuccess(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
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
        <h2>Welcome Back</h2>
        <p className="auth-sub">Sign in to Pacifiqu Umuhoza Ecommerce Dashboard</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary full-width">
            Sign In to Dashboard
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <span onClick={switchToRegister}>Create an Account</span>
        </p>
      </div>
    </div>
  );
}