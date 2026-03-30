//Sewni

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { apiClient } from '../../api/client';
import './DashboardOverview.css';

const DashboardOverview = ({ adminData, setActivePage }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      if (currentUser && currentUser.username) {
        // Fetch dashboard summary with admin headers
        const summaryResponse = await apiClient.get("/admin/dashboard/summary", {
          headers: {
            'username': currentUser.username
          }
        });

        const alertsResponse = await apiClient.get("/admin/dashboard/alerts", {
          headers: {
            'username': currentUser.username
          }
        });

        // Fetch donations count using same method as DonationOversight
        const donationsResponse = await apiClient.get("/admin/donations", {
          headers: {
            'username': currentUser.username
          }
        });

        // Fetch pending verifications using same method as UserVerification
        const pendingNgosResponse = await apiClient.get("/admin/verification/ngos/pending", {
          headers: {
            'username': currentUser.username
          }
        });

        const pendingDonorsResponse = await apiClient.get("/admin/verification/donors/pending", {
          headers: {
            'username': currentUser.username
          }
        });

        if (summaryResponse && alertsResponse) {
          setDashboardData({
            summary: summaryResponse,
            alerts: alertsResponse,
            donations: donationsResponse || [],
            pendingNgos: pendingNgosResponse || [],
            pendingDonors: pendingDonorsResponse || []
          });
        } else {
          throw new Error('Failed to fetch dashboard data');
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="admin-loading-spinner"></div>
        <p className="admin-loading-text">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error-state">
        <p className="admin-error-text">{error}</p>
        <button className="admin-retry-btn" onClick={fetchDashboardData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-overview">
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-title">Total Admins</div>
            <div className="admin-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
          </div>
          <div className="admin-stat-value">{dashboardData?.summary?.totalAdmins || 0}</div>
          <p className="admin-stat-description">Registered administrators</p>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-title">Total NGOs</div>
            <div className="admin-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
            </div>
          </div>
          <div className="admin-stat-value">{dashboardData?.summary?.totalNgos || 0}</div>
          <p className="admin-stat-description">Registered NGOs</p>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-title">Total Donors</div>
            <div className="admin-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            </div>
          </div>
          <div className="admin-stat-value">{dashboardData?.summary?.totalDonators || 0}</div>
          <p className="admin-stat-description">Registered donors</p>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-title">Active Donations</div>
            <div className="admin-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
          </div>
          <div className="admin-stat-value">{dashboardData?.donations?.length || 0}</div>
          <p className="admin-stat-description">Currently active</p>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-title">Pending Verifications</div>
            <div className="admin-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
          </div>
          <div className="admin-stat-value">{(dashboardData?.pendingNgos?.length || 0) + (dashboardData?.pendingDonors?.length || 0)}</div>
          <p className="admin-stat-description">Awaiting review</p>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-title">System Health</div>
            <div className="admin-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
          </div>
          <div className="admin-stat-value">98%</div>
          <p className="admin-stat-description">All systems operational</p>
        </div>
      </div>

      <div className="admin-dashboard-grid">
        <div className="admin-dashboard-section">
          <div className="admin-quick-actions-title">Quick Actions</div>
          <div className="admin-quick-actions">
            <button className="admin-action-btn" onClick={() => setActivePage('register')}>
              <span className="admin-action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </span>
              <span className="admin-action-text">Register New Admin</span>
            </button>
            <button className="admin-action-btn" onClick={() => setActivePage && setActivePage('verification')}>
              <span className="admin-action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
              </span>
              <span className="admin-action-text">Verify Organizations</span>
            </button>
            <button className="admin-action-btn" onClick={() => setActivePage('analytics')}>
              <span className="admin-action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </span>
              <span className="admin-action-text">View Analytics</span>
            </button>
            <button className="admin-action-btn" onClick={() => setActivePage('audit-logs')}>
              <span className="admin-action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </span>
              <span className="admin-action-text">View Audit Logs</span>
            </button>
            <button className="admin-action-btn">
              <span className="admin-action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"/>
                </svg>
              </span>
              <span className="admin-action-text">System Settings</span>
            </button>
            <button className="admin-action-btn">
              <span className="admin-action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <span className="admin-action-text">Send Notifications</span>
            </button>
            <button className="admin-action-btn">
              <span className="admin-action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </span>
              <span className="admin-action-text">Manage Reports</span>
            </button>
            <button className="admin-action-btn">
              <span className="admin-action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </span>
              <span className="admin-action-text">Export Reports</span>
            </button>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-grid">
        <div className="admin-dashboard-section">
          <div className="admin-section-title">System Overview</div>
          <div className="admin-system-stats">
            <div className="admin-system-item">
              <div className="admin-system-label">Server Status</div>
              <div className="admin-system-value admin-status-online">Online</div>
            </div>
            <div className="admin-system-item">
              <div className="admin-system-label">Database Status</div>
              <div className="admin-system-value admin-status-online">Connected</div>
            </div>
            <div className="admin-system-item">
              <div className="admin-system-label">API Response Time</div>
              <div className="admin-system-value">120ms</div>
            </div>
            <div className="admin-system-item">
              <div className="admin-system-label">Storage Used</div>
              <div className="admin-system-value">2.4GB / 10GB</div>
            </div>
            <div className="admin-system-item">
              <div className="admin-system-label">Last Backup</div>
              <div className="admin-system-value">2 hours ago</div>
            </div>
          </div>
        </div>
        
        <div className="admin-dashboard-section">
          <div className="admin-section-title">Recent Activity</div>
          <div className="admin-activity-feed">
            <div className="admin-activity-feed-item">
              <div className="admin-activity-feed-icon admin-icon-success">✓</div>
              <div className="admin-activity-feed-content">
                <div className="admin-activity-feed-title">New NGO Verified</div>
                <div className="admin-activity-feed-desc">Food Bank Foundation approved</div>
                <div className="admin-activity-feed-time">5 minutes ago</div>
              </div>
            </div>
            <div className="admin-activity-feed-item">
              <div className="admin-activity-feed-icon admin-icon-warning">⚠</div>
              <div className="admin-activity-feed-content">
                <div className="admin-activity-feed-title">High Server Load</div>
                <div className="admin-activity-feed-desc">CPU usage at 85%</div>
                <div className="admin-activity-feed-time">15 minutes ago</div>
              </div>
            </div>
            <div className="admin-activity-feed-item">
              <div className="admin-activity-feed-icon admin-icon-info">ℹ</div>
              <div className="admin-activity-feed-content">
                <div className="admin-activity-feed-title">System Update Available</div>
                <div className="admin-activity-feed-desc">Version 2.1.0 ready to install</div>
                <div className="admin-activity-feed-time">1 hour ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-activity-section">
        <div className="admin-section-header">
          <div className="admin-section-title">Recent Admin Activity</div>
        </div>
        <ul className="admin-activity-list">
          {dashboardData?.alerts?.recentAdmins?.map((admin, index) => (
            <li key={admin._id || index} className="admin-activity-item">
              <div className="admin-activity-avatar">
                {admin.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="admin-activity-content">
                <div className="admin-activity-name">{admin.name}</div>
                <div className="admin-activity-username">@{admin.username}</div>
                <div className="admin-activity-time">
                  Joined {new Date(admin.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="admin-activity-meta">
                <div className="admin-activity-date">
                  {new Date(admin.createdAt).toLocaleDateString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardOverview;
