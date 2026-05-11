import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const SecurityDashboard = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchLogs();
    }
  }, [user]);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/users/manage/security_logs/');
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Access Denied</h2>
          <p>Only administrators can view this page.</p>
        </div>
      </div>
    );
  }

  const screenshotAttempts = logs.filter(l => l.action === 'print_screen_attempt' || l.action === 'screenshot_attempt');

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>🔒 Security Dashboard</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>Monitor security events and screenshot attempts</p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3>Total Events</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#4f46e5' }}>{logs.length}</p>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3>Screenshot Attempts</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>{screenshotAttempts.length}</p>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3>Active Sessions</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#22c55e' }}>-</p>
          </div>
        </div>

        {/* Security Logs Table */}
        <h2 style={{ marginBottom: '20px' }}>Security Logs</h2>
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8f9fa' }}>
              <tr>
                <th style={{ padding: '15px', textAlign: 'left' }}>Time</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>User</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Action</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>IP Address</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center' }}>Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center' }}>No security events yet</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #eee', background: log.action.includes('attempt') ? '#fef2f2' : 'transparent' }}>
                    <td style={{ padding: '12px' }}>{new Date(log.time).toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>{log.user}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        background: log.action.includes('attempt') ? '#ef4444' : '#22c55e', 
                        color: 'white' 
                      }}>
                        {log.action.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{log.ip || 'Unknown'}</td>
                    <td style={{ padding: '12px', fontSize: '12px' }}>{JSON.stringify(log.details).substring(0, 80)}</td>
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

export default SecurityDashboard;