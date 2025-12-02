'use client';

import { useState, useEffect } from 'react';

interface TrackingStats {
  lastCustomerId: string;
  siteVisitorsTotal: number;
  siteVisitorsUnique: number;
  stage1: number;
  stage2: number;
  stage3: number;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState<TrackingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if already authenticated in session
    const auth = sessionStorage.getItem('admin_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Fetch tracking stats initially
    fetchStats();

    // Refresh stats every 5 seconds
    const interval = setInterval(fetchStats, 5000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/get-tracking-stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

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

      {/* Live Campaign Metrics Overview */}
      <div style={{
        padding: '20px 30px',
        background: 'white',
        borderBottom: '1px solid #e0e0e0',
      }}>
        <h2 style={{ fontSize: '18px', color: '#1f3a33', marginBottom: '15px', fontWeight: '600' }}>
          📊 Live Campaign Metrics
        </h2>

        {loading ? (
          <p style={{ color: '#666' }}>Loading stats...</p>
        ) : stats ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '15px',
          }}>
            <div style={{
              background: '#f8f9fa',
              padding: '15px',
              borderRadius: '8px',
              border: '2px solid #e9ecef',
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Last Customer ID</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#1f3a33' }}>{stats.lastCustomerId}</div>
            </div>

            <div style={{
              background: '#e8f5e9',
              padding: '15px',
              borderRadius: '8px',
              border: '2px solid #c8e6c9',
            }}>
              <div style={{ fontSize: '12px', color: '#2e7d32', marginBottom: '5px' }}>Site Visitors (Total)</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#1b5e20' }}>{stats.siteVisitorsTotal.toLocaleString()}</div>
            </div>

            <div style={{
              background: '#e3f2fd',
              padding: '15px',
              borderRadius: '8px',
              border: '2px solid #bbdefb',
            }}>
              <div style={{ fontSize: '12px', color: '#1565c0', marginBottom: '5px' }}>Site Visitors (Unique)</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#0d47a1' }}>{stats.siteVisitorsUnique.toLocaleString()}</div>
            </div>

            <div style={{
              background: '#fff3e0',
              padding: '15px',
              borderRadius: '8px',
              border: '2px solid #ffe0b2',
            }}>
              <div style={{ fontSize: '12px', color: '#e65100', marginBottom: '5px' }}>Stage 1 (Basic Info)</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#bf360c' }}>{stats.stage1.toLocaleString()}</div>
            </div>

            <div style={{
              background: '#f3e5f5',
              padding: '15px',
              borderRadius: '8px',
              border: '2px solid #e1bee7',
            }}>
              <div style={{ fontSize: '12px', color: '#6a1b9a', marginBottom: '5px' }}>Stage 2 (Q1-Q5)</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#4a148c' }}>{stats.stage2.toLocaleString()}</div>
            </div>

            <div style={{
              background: '#fce4ec',
              padding: '15px',
              borderRadius: '8px',
              border: '2px solid #f8bbd0',
            }}>
              <div style={{ fontSize: '12px', color: '#c2185b', marginBottom: '5px' }}>Stage 3 (Complete)</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#880e4f' }}>{stats.stage3.toLocaleString()}</div>
            </div>

            <div style={{
              background: '#fff9c4',
              padding: '15px',
              borderRadius: '8px',
              border: '2px solid #fff59d',
            }}>
              <div style={{ fontSize: '12px', color: '#f57f17', marginBottom: '5px' }}>Conversion Rate</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#f57f17' }}>
                {stats.siteVisitorsUnique > 0
                  ? ((stats.stage1 / stats.siteVisitorsUnique) * 100).toFixed(1)
                  : '0.0'}%
              </div>
            </div>

            <div style={{
              background: '#e0f7fa',
              padding: '15px',
              borderRadius: '8px',
              border: '2px solid #b2ebf2',
            }}>
              <div style={{ fontSize: '12px', color: '#00695c', marginBottom: '5px' }}>Completion Rate</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#004d40' }}>
                {stats.stage1 > 0
                  ? ((stats.stage3 / stats.stage1) * 100).toFixed(1)
                  : '0.0'}%
              </div>
            </div>
          </div>
        ) : (
          <p style={{ color: '#666' }}>Unable to load stats</p>
        )}

        <div style={{ marginTop: '10px', fontSize: '11px', color: '#999', textAlign: 'right' }}>
          Auto-refreshes every 5 seconds
        </div>
      </div>

      <iframe
        src="/email-manager.html"
        style={{
          width: '100%',
          height: 'calc(100vh - 280px)',
          border: 'none',
        }}
        title="Email Manager"
      />
    </div>
  );
}
