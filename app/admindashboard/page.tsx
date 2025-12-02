'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already authenticated in session
    const auth = sessionStorage.getItem('admin_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === 'Ronabambi2025') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      setError('');
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1f3a33 0%, #70d490 100%)',
        padding: '20px',
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ color: '#1f3a33', fontSize: '28px', marginBottom: '10px' }}>
              🔐 Admin Dashboard
            </h1>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Enter password to access
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#1f3a33',
                fontWeight: '600',
                fontSize: '14px',
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #cfe8d7',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                }}
                autoFocus
              />
            </div>

            {error && (
              <div style={{
                background: '#fee',
                color: '#c33',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px',
                textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                background: '#1f3a33',
                color: 'white',
                padding: '14px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#2a4d43'}
              onMouseOut={(e) => e.currentTarget.style.background = '#1f3a33'}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{
        background: 'linear-gradient(to right, #1f3a33, #70d490)',
        color: 'white',
        padding: '20px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '5px' }}>Smile Moore Admin Dashboard</h1>
          <p style={{ opacity: 0.9, fontSize: '14px' }}>Marketing Campaign Manager</p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid white',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Logout
        </button>
      </div>

      <iframe
        src="/email-manager.html"
        style={{
          width: '100%',
          height: 'calc(100vh - 100px)',
          border: 'none',
        }}
        title="Email Manager"
      />
    </div>
  );
}
