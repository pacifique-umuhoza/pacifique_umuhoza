import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login');

  useEffect(() => {
    const savedUser = localStorage.getItem('pacifiqu_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleAuthSuccess = (userData, token) => {
    localStorage.setItem('pacifiqu_token', token);
    localStorage.setItem('pacifiqu_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('pacifiqu_token');
    localStorage.removeItem('pacifiqu_user');
    setUser(null);
  };

  if (!user) {
    return authView === 'login' ? (
      <Login
        onLoginSuccess={handleAuthSuccess}
        switchToRegister={() => setAuthView('register')}
      />
    ) : (
      <Register
        onRegisterSuccess={handleAuthSuccess}
        switchToLogin={() => setAuthView('login')}
      />
    );
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;