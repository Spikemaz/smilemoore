'use client';

import { useState, useEffect } from 'react';

interface TrackingStats {
  lastCustomerId: string;
  siteVisitorsTotal: number;
  siteVisitorsUnique: number;
  stage1: number;
  stage2: number;
  stage3: number;
  whatsapp: {
    sent: number;
    delivered: number;
    read: number;
    replied: number;
    readRate: string;
    replyRate: string;
  };
  sms: {
    sent: number;
    delivered: number;
    clicked: number;
    deliveryRate: string;
    clickRate: string;
  };
  funnel: {
    total: number;
    completed: number;
    completionRate: string;
  };
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
        gap: '30px',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '5px' }}>Smile Moore Admin Dashboard</h1>
          <p style={{ opacity: 0.9, fontSize: '14px' }}>Marketing Campaign Manager</p>
        </div>

        {/* Live Metrics in Header */}
        {!loading && stats && (
          <div style={{
            display: 'flex',
            gap: '12px',
            flex: '1',
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', padding: '8px 12px', borderRadius: '6px', minWidth: '90px' }}>
              <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '3px' }}>Customer ID</div>
              <div style={{ fontSize: '19px', fontWeight: '700' }}>{stats.lastCustomerId}</div>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', padding: '8px 12px', borderRadius: '6px', minWidth: '90px' }}>
              <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '3px' }}>Visitors (T)</div>
              <div style={{ fontSize: '19px', fontWeight: '700' }}>{stats.siteVisitorsTotal}</div>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', padding: '8px 12px', borderRadius: '6px', minWidth: '90px' }}>
              <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '3px' }}>Visitors (U)</div>
              <div style={{ fontSize: '19px', fontWeight: '700' }}>{stats.siteVisitorsUnique}</div>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', padding: '8px 12px', borderRadius: '6px', minWidth: '84px' }}>
              <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '3px' }}>Stage 1</div>
              <div style={{ fontSize: '19px', fontWeight: '700' }}>{stats.stage1}</div>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', padding: '8px 12px', borderRadius: '6px', minWidth: '84px' }}>
              <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '3px' }}>Stage 2</div>
              <div style={{ fontSize: '19px', fontWeight: '700' }}>{stats.stage2}</div>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', padding: '8px 12px', borderRadius: '6px', minWidth: '84px' }}>
              <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '3px' }}>Stage 3</div>
              <div style={{ fontSize: '19px', fontWeight: '700' }}>{stats.stage3}</div>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', padding: '8px 12px', borderRadius: '6px', minWidth: '102px' }}>
              <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '3px' }}>Conv. Rate</div>
              <div style={{ fontSize: '19px', fontWeight: '700' }}>
                {stats.siteVisitorsUnique > 0 ? ((stats.stage1 / stats.siteVisitorsUnique) * 100).toFixed(1) : '0.0'}%
              </div>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', padding: '8px 12px', borderRadius: '6px', minWidth: '102px' }}>
              <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '3px' }}>Compl. Rate</div>
              <div style={{ fontSize: '19px', fontWeight: '700' }}>
                {stats.stage1 > 0 ? ((stats.stage3 / stats.stage1) * 100).toFixed(1) : '0.0'}%
              </div>
            </div>
          </div>
        )}

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
            whiteSpace: 'nowrap',
          }}
        >
          Logout
        </button>
      </div>

      <iframe
        src="/email-manager.html"
        style={{
          width: '100%',
          height: 'calc(100vh - 90px)',
          border: 'none',
        }}
        title="Email Manager"
      />
    </div>
  );
}
