//Sewni

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from "../../context/AuthContext";
import { apiClient } from '../../api/client';
import './ComplaintManagement.css';

const ComplaintManagement = ({ adminData, onLogout }) => {
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    status: '',
    category: '',
    severity: ''
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    adminNotes: ''
  });

  const fetchComplaints = useCallback(async () => {
    try {
      if (currentUser && currentUser.username) {
        const queryParams = new URLSearchParams();
        if (filter.status) queryParams.append('status', filter.status);
        if (filter.category) queryParams.append('category', filter.category);
        if (filter.severity) queryParams.append('severity', filter.severity);

        const response = await apiClient.get(`/complaints?${queryParams}`, {
          headers: {
            'username': currentUser.username
          }
        });

        if (response) {
          setComplaints(response);
        } else {
          throw new Error('Failed to fetch complaints');
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser, filter]);

  const fetchAnalytics = useCallback(async () => {
    try {
      if (currentUser && currentUser.username) {
        const response = await apiClient.get('/complaints/analytics', {
          headers: {
            'username': currentUser.username
          }
        });

        if (response) {
          setAnalytics(response);
        }
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchComplaints();
    fetchAnalytics();
  }, [fetchComplaints, fetchAnalytics]);

  const handleFilterChange = (key, value) => {
    setFilter(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleViewDetails = async (complaintId) => {
    try {
      const response = await apiClient.get(`/complaints/${complaintId}`, {
        headers: {
          'username': currentUser.username
        }
      });

      if (response) {
        setSelectedComplaint(response);
        setShowDetailsModal(true);
      }
    } catch (error) {
      setError('Failed to fetch complaint details');
    }
  };

  const handleUpdateComplaint = async () => {
    try {
      const response = await apiClient.patch(`/complaints/${selectedComplaint._id}`, updateData, {
        headers: {
          'username': currentUser.username
        }
      });

      if (response) {
        setShowUpdateModal(false);
        setSelectedComplaint(null);
        setUpdateData({ status: '', adminNotes: '' });
        fetchComplaints();
        fetchAnalytics();
      }
    } catch (error) {
      setError('Failed to update complaint');
    }
  };

  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) {
      return;
    }

    try {
      const response = await apiClient.delete(`/complaints/${complaintId}`, {
        headers: {
          'username': currentUser.username
        }
      });

      if (response) {
        fetchComplaints();
        fetchAnalytics();
      }
    } catch (error) {
      setError('Failed to delete complaint');
    }
  };

  const openUpdateModal = (complaint) => {
    setSelectedComplaint(complaint);
    setUpdateData({
      status: complaint.status,
      adminNotes: complaint.adminNotes || ''
    });
    setShowUpdateModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return '#ef4444';
      case 'UNDER_REVIEW': return '#f59e0b';
      case 'RESOLVED': return '#10b981';
      case 'REJECTED': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'LOW': return '#10b981';
      case 'MEDIUM': return '#f59e0b';
      case 'HIGH': return '#ef4444';
      case 'CRITICAL': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'ABUSE': return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      );
      case 'MISCONDUCT': return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      );
      case 'FOOD_QUALITY': return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
          <path d="M2 8h16"/>
          <path d="M4 16v-6a6 6 0 0 1 12 0v6"/>
        </svg>
      );
      case 'SYSTEM_FAILURE': return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      );
      case 'OTHER': return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      );
      default: return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      );
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="admin-loading-spinner"></div>
        <p className="admin-loading-text">Loading complaints data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error-state">
        <p className="admin-error-text">{error}</p>
        <button className="admin-retry-btn" onClick={fetchComplaints}>Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-complaint-content">
      <div className="admin-complaint-header">
        <h1 className="admin-page-title">Incident, Abuse & Complaint Management</h1>
        <p className="admin-page-subtitle">Monitor and manage user complaints and abuse reports</p>
      </div>

      {/* Analytics Cards */}
      <div className="admin-complaint-stats-grid">
        <div className="admin-complaint-stat-card">
          <div className="admin-complaint-stat-header">
            <div className="admin-complaint-stat-title">Total Complaints</div>
            <div className="admin-complaint-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
          </div>
          <div className="admin-complaint-stat-value">{analytics?.total || 0}</div>
          <p className="admin-complaint-stat-description">All reported incidents</p>
        </div>
        
        <div className="admin-complaint-stat-card">
          <div className="admin-complaint-stat-header">
            <div className="admin-complaint-stat-title">Open Cases</div>
            <div className="admin-complaint-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
          </div>
          <div className="admin-complaint-stat-value">{analytics?.open || 0}</div>
          <p className="admin-complaint-stat-description">Awaiting review</p>
        </div>
        
        <div className="admin-complaint-stat-card">
          <div className="admin-complaint-stat-header">
            <div className="admin-complaint-stat-title">Resolved</div>
            <div className="admin-complaint-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
            </div>
          </div>
          <div className="admin-complaint-stat-value">{analytics?.resolved || 0}</div>
          <p className="admin-complaint-stat-description">Successfully resolved</p>
        </div>
        
        <div className="admin-complaint-stat-card">
          <div className="admin-complaint-stat-header">
            <div className="admin-complaint-stat-title">Resolution Rate</div>
            <div className="admin-complaint-stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
            </div>
          </div>
          <div className="admin-complaint-stat-value">
            {analytics?.total > 0 ? Math.round((analytics.resolved / analytics.total) * 100) : 0}%
          </div>
          <p className="admin-complaint-stat-description">Cases resolved</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-complaint-filters">
        <div className="admin-filter-group">
          <label className="admin-filter-label">Status</label>
          <select 
            className="admin-filter-select"
            value={filter.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="admin-filter-group">
          <label className="admin-filter-label">Category</label>
          <select 
            className="admin-filter-select"
            value={filter.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="ABUSE">Abuse</option>
            <option value="MISCONDUCT">Misconduct</option>
            <option value="FOOD_QUALITY">Food Quality</option>
            <option value="SYSTEM_FAILURE">System Failure</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="admin-filter-group">
          <label className="admin-filter-label">Severity</label>
          <select 
            className="admin-filter-select"
            value={filter.severity}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
          >
            <option value="">All Severities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      <div className="admin-complaints-list">
        <div className="admin-complaints-header">
          <h2 className="admin-complaints-title">Complaints ({complaints.length})</h2>
        </div>
        
        {complaints.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </div>
            <h3 className="admin-empty-title">No complaints found</h3>
            <p className="admin-empty-description">No complaints match the current filters</p>
          </div>
        ) : (
          <div className="admin-complaints-grid">
            {complaints.map((complaint) => (
              <div key={complaint._id} className="admin-complaint-card">
                <div className="admin-complaint-card-header">
                  <div className="admin-complaint-category">
                    <span className="admin-complaint-category-icon">
                      {getCategoryIcon(complaint.category)}
                    </span>
                    <span className="admin-complaint-category-text">{complaint.category}</span>
                  </div>
                  <div className="admin-complaint-severity" style={{ color: getSeverityColor(complaint.severity) }}>
                    {complaint.severity}
                  </div>
                </div>
                
                <div className="admin-complaint-card-content">
                  <h3 className="admin-complaint-title">{complaint.title}</h3>
                  <p className="admin-complaint-description">
                    {complaint.description.length > 100 
                      ? `${complaint.description.substring(0, 100)}...` 
                      : complaint.description}
                  </p>
                  
                  <div className="admin-complaint-meta">
                    <div className="admin-complaint-info">
                      <span className="admin-complaint-label">Reported by:</span>
                      <span className="admin-complaint-value">{complaint.reportedBy} ({complaint.reportedByRole})</span>
                    </div>
                    {complaint.againstUsername && (
                      <div className="admin-complaint-info">
                        <span className="admin-complaint-label">Against:</span>
                        <span className="admin-complaint-value">{complaint.againstUsername} ({complaint.againstRole})</span>
                      </div>
                    )}
                    <div className="admin-complaint-info">
                      <span className="admin-complaint-label">Date:</span>
                      <span className="admin-complaint-value">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="admin-complaint-card-footer">
                  <div className="admin-complaint-status" style={{ color: getStatusColor(complaint.status) }}>
                    {complaint.status}
                  </div>
                  <div className="admin-complaint-actions">
                    <button 
                      className="admin-complaint-action-btn admin-view-btn"
                      onClick={() => handleViewDetails(complaint._id)}
                    >
                      View Details
                    </button>
                    <button 
                      className="admin-complaint-action-btn admin-update-btn"
                      onClick={() => openUpdateModal(complaint)}
                    >
                      Update
                    </button>
                    <button 
                      className="admin-complaint-action-btn admin-delete-btn"
                      onClick={() => handleDeleteComplaint(complaint._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedComplaint && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Complaint Details</h2>
              <button 
                className="admin-modal-close"
                onClick={() => setShowDetailsModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-content">
              <div className="admin-complaint-detail-section">
                <h3 className="admin-detail-section-title">Incident Information</h3>
                <div className="admin-detail-grid">
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Title:</span>
                    <span className="admin-detail-value">{selectedComplaint.title}</span>
                  </div>
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Category:</span>
                    <span className="admin-detail-value">{selectedComplaint.category}</span>
                  </div>
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Severity:</span>
                    <span className="admin-detail-value" style={{ color: getSeverityColor(selectedComplaint.severity) }}>
                      {selectedComplaint.severity}
                    </span>
                  </div>
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Status:</span>
                    <span className="admin-detail-value" style={{ color: getStatusColor(selectedComplaint.status) }}>
                      {selectedComplaint.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="admin-complaint-detail-section">
                <h3 className="admin-detail-section-title">Description</h3>
                <p className="admin-detail-description">{selectedComplaint.description}</p>
              </div>

              <div className="admin-complaint-detail-section">
                <h3 className="admin-detail-section-title">People Involved</h3>
                <div className="admin-detail-grid">
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Reported by:</span>
                    <span className="admin-detail-value">{selectedComplaint.reportedBy} ({selectedComplaint.reportedByRole})</span>
                  </div>
                  {selectedComplaint.againstUsername && (
                    <div className="admin-detail-item">
                      <span className="admin-detail-label">Against:</span>
                      <span className="admin-detail-value">{selectedComplaint.againstUsername} ({selectedComplaint.againstRole})</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedComplaint.adminNotes && (
                <div className="admin-complaint-detail-section">
                  <h3 className="admin-detail-section-title">Admin Notes</h3>
                  <p className="admin-detail-description">{selectedComplaint.adminNotes}</p>
                </div>
              )}

              <div className="admin-complaint-detail-section">
                <h3 className="admin-detail-section-title">Timeline</h3>
                <div className="admin-detail-grid">
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Created:</span>
                    <span className="admin-detail-value">
                      {new Date(selectedComplaint.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Last Updated:</span>
                    <span className="admin-detail-value">
                      {new Date(selectedComplaint.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedComplaint && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Update Complaint</h2>
              <button 
                className="admin-modal-close"
                onClick={() => setShowUpdateModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-content">
              <div className="admin-form-group">
                <label className="admin-form-label">Status</label>
                <select 
                  className="admin-form-select"
                  value={updateData.status}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="OPEN">Open</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Admin Notes</label>
                <textarea 
                  className="admin-form-textarea"
                  value={updateData.adminNotes}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, adminNotes: e.target.value }))}
                  placeholder="Add notes about this complaint..."
                  rows="4"
                />
              </div>

              <div className="admin-modal-actions">
                <button 
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setShowUpdateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="admin-btn admin-btn-primary"
                  onClick={handleUpdateComplaint}
                >
                  Update Complaint
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintManagement;
