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
      case 'ABUSE': return '⚠️';
      case 'MISCONDUCT': return '🚫';
      case 'FOOD_QUALITY': return '🍽️';
      case 'SYSTEM_FAILURE': return '💻';
      case 'OTHER': return '📋';
      default: return '📋';
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
            <div className="admin-complaint-stat-icon">📊</div>
          </div>
          <div className="admin-complaint-stat-value">{analytics?.total || 0}</div>
          <p className="admin-complaint-stat-description">All reported incidents</p>
        </div>
        
        <div className="admin-complaint-stat-card">
          <div className="admin-complaint-stat-header">
            <div className="admin-complaint-stat-title">Open Cases</div>
            <div className="admin-complaint-stat-icon">🔴</div>
          </div>
          <div className="admin-complaint-stat-value">{analytics?.open || 0}</div>
          <p className="admin-complaint-stat-description">Awaiting review</p>
        </div>
        
        <div className="admin-complaint-stat-card">
          <div className="admin-complaint-stat-header">
            <div className="admin-complaint-stat-title">Resolved</div>
            <div className="admin-complaint-stat-icon">✅</div>
          </div>
          <div className="admin-complaint-stat-value">{analytics?.resolved || 0}</div>
          <p className="admin-complaint-stat-description">Successfully resolved</p>
        </div>
        
        <div className="admin-complaint-stat-card">
          <div className="admin-complaint-stat-header">
            <div className="admin-complaint-stat-title">Resolution Rate</div>
            <div className="admin-complaint-stat-icon">📈</div>
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
            <div className="admin-empty-icon">📋</div>
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
