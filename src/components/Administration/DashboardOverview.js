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
            <div className="admin-stat-icon">👥</div>
          </div>
          <div className="admin-stat-value">{dashboardData?.summary?.totalAdmins || 0}</div>
          <p className="admin-stat-description">Registered administrators</p>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-title">Total NGOs</div>
            <div className="admin-stat-icon">🏢</div>
          </div>
          <div className="admin-stat-value">{dashboardData?.summary?.totalNgos || 0}</div>
          <p className="admin-stat-description">Registered NGOs</p>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-title">Total Donors</div>
            <div className="admin-stat-icon">🤝</div>
          </div>
          <div className="admin-stat-value">{dashboardData?.summary?.totalDonators || 0}</div>
          <p className="admin-stat-description">Registered donors</p>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-title">Active Donations</div>
            <div className="admin-stat-icon">📦</div>
          </div>
          <div className="admin-stat-value">{dashboardData?.donations?.length || 0}</div>
          <p className="admin-stat-description">Currently active</p>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-title">Pending Verifications</div>
            <div className="admin-stat-icon">⏳</div>
          </div>
          <div className="admin-stat-value">{(dashboardData?.pendingNgos?.length || 0) + (dashboardData?.pendingDonors?.length || 0)}</div>
          <p className="admin-stat-description">Awaiting review</p>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-title">System Health</div>
            <div className="admin-stat-icon">💚</div>
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
              <span className="admin-action-icon">➕</span>
              <span className="admin-action-text">Register New Admin</span>
            </button>
            <button className="admin-action-btn" onClick={() => setActivePage && setActivePage('verification')}>
              <span className="admin-action-icon">✅</span>
              <span className="admin-action-text">Verify Organizations</span>
            </button>
            <button className="admin-action-btn" onClick={() => setActivePage('analytics')}>
              <span className="admin-action-icon">📊</span>
              <span className="admin-action-text">View Analytics</span>
            </button>
            <button className="admin-action-btn" onClick={() => setActivePage('audit-logs')}>
              <span className="admin-action-icon">📋</span>
              <span className="admin-action-text">View Audit Logs</span>
            </button>
            <button className="admin-action-btn">
              <span className="admin-action-icon">🔧</span>
              <span className="admin-action-text">System Settings</span>
            </button>
            <button className="admin-action-btn">
              <span className="admin-action-icon">📧</span>
              <span className="admin-action-text">Send Notifications</span>
            </button>
            <button className="admin-action-btn">
              <span className="admin-action-icon">🚨</span>
              <span className="admin-action-text">Manage Reports</span>
            </button>
            <button className="admin-action-btn">
              <span className="admin-action-icon">📈</span>
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
