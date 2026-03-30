//Sewni

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from "../../context/AuthContext";
import { apiClient } from '../../api/client';
import './SystemAuditLogs.css';

const SystemAuditLogs = ({ adminData }) => {
  const { currentUser } = useAuth();
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSearchTerm, setTempSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    action: '',
    fromDate: '',
    toDate: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1
  });

  const actionOptions = [
    'APPROVE_NGO', 'REJECT_NGO', 'APPROVE_DONOR', 'REJECT_DONOR'
  ];

  const targetTypeOptions = [
    'NGO', 'DONATOR', 'ADMIN', 'REPORT', 'SYSTEM', 'DONATION', 'COMPLAINT', 'VERIFICATION'
  ];

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (searchTerm) queryParams.append('adminUsername', searchTerm);
      if (filters.action) queryParams.append('action', filters.action);
      if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
      if (filters.toDate) queryParams.append('toDate', filters.toDate);
      queryParams.append('page', filters.page);
      queryParams.append('limit', filters.limit);

      const response = await apiClient.get(`/admin/audit-logs?${queryParams}`, {
        headers: {
          'username': currentUser.username
        }
      });

      if (response && response.data) {
        setAuditLogs(response.data.logs || []);
        setPagination({
          total: response.data.total || 0,
          page: response.data.page || 1,
          pages: response.data.pages || 1
        });
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  }, [currentUser, searchTerm, filters]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleSearch = () => {
    setSearchTerm(tempSearchTerm);
    setFilters(prev => ({
      ...prev,
      page: 1 // Reset to first page when searching
    }));
  };

  const clearFilters = () => {
    setTempSearchTerm('');
    setSearchTerm('');
    setFilters({
      action: '',
      fromDate: '',
      toDate: '',
      page: 1,
      limit: 10
    });
  };

  const getActionIcon = (action) => {
    const icons = {
      'APPROVE_NGO': '✅',
      'REJECT_NGO': '❌',
      'APPROVE_DONOR': '✅',
      'REJECT_DONOR': '❌'
    };
    return icons[action] || '📋';
  };

  const getActionColor = (action) => {
    const colors = {
      'APPROVE_NGO': 'admin-action-approve',
      'REJECT_NGO': 'admin-action-reject',
      'APPROVE_DONOR': 'admin-action-approve',
      'REJECT_DONOR': 'admin-action-reject'
    };
    return colors[action] || 'admin-action-default';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading && auditLogs.length === 0) {
    return (
      <div className="admin-audit-logs-content">
        <div className="admin-loading-state">
          <div className="admin-loading-spinner"></div>
          <p className="admin-loading-text">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  if (error && auditLogs.length === 0) {
    return (
      <div className="admin-audit-logs-content">
        <div className="admin-error-state">
          <p className="admin-error-text">{error}</p>
          <button className="admin-retry-btn" onClick={fetchAuditLogs}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-audit-logs-content">
        <div className="admin-audit-logs-header">
          <div className="admin-audit-logs-title">
            <h1>System Audit Logs</h1>
            <p className="admin-audit-logs-subtitle">Monitor and track all administrative activities</p>
          </div>
          
          <div className="admin-search-section">
            <div className="admin-search-container">
              <span className="admin-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by admin username..."
                value={tempSearchTerm}
                onChange={(e) => setTempSearchTerm(e.target.value)}
                className="admin-search-input"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                onClick={handleSearch}
                className="admin-search-btn"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="admin-audit-logs-filters">
          <div className="admin-filter-section">
            <div className="admin-filter-header">
              <h3>Filters</h3>
              <div className="admin-filter-indicator">
                <span className="admin-filter-icon">🎯</span>
                <span className="admin-filter-text">Active Filters</span>
              </div>
            </div>
            <div className="admin-filter-grid">
              <div className="admin-filter-group">
                <label>Action</label>
                <select
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  className="admin-filter-select"
                >
                  <option value="">All Actions</option>
                  {actionOptions.map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
              </div>
              
              <div className="admin-filter-group">
                <label>From Date</label>
                <input
                  type="datetime-local"
                  value={filters.fromDate}
                  onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                  className="admin-filter-input"
                />
              </div>
              
              <div className="admin-filter-group">
                <label>To Date</label>
                <input
                  type="datetime-local"
                  value={filters.toDate}
                  onChange={(e) => handleFilterChange('toDate', e.target.value)}
                  className="admin-filter-input"
                />
              </div>
            </div>
            
            <div className="admin-filter-actions">
              <button className="admin-filter-btn admin-filter-primary" onClick={fetchAuditLogs}>
                Apply Filters
              </button>
              <button className="admin-filter-btn admin-filter-secondary" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="admin-audit-logs-stats">
          <div className="admin-stat-card-creative">
            <div className="admin-stat-icon-wrapper">
              <div className="admin-stat-icon">📋</div>
            </div>
            <div className="admin-stat-content">
              <div className="admin-stat-value">{pagination.total}</div>
              <div className="admin-stat-title">Total Logs</div>
              <div className="admin-stat-description">All audit records</div>
            </div>
            <div className="admin-stat-decoration"></div>
          </div>
          
          <div className="admin-stat-card-creative admin-stat-page">
            <div className="admin-stat-icon-wrapper">
              <div className="admin-stat-icon">📄</div>
            </div>
            <div className="admin-stat-content">
              <div className="admin-stat-value">{pagination.page}</div>
              <div className="admin-stat-title">Current Page</div>
              <div className="admin-stat-description">of {pagination.pages} pages</div>
            </div>
            <div className="admin-stat-decoration"></div>
          </div>
        </div>

        <div className="admin-audit-logs-table-container">
          <div className="admin-audit-logs-table">
            <div className="admin-table-header">
              <div className="admin-table-row">
                <div className="admin-table-cell admin-table-header-cell">Action</div>
                <div className="admin-table-cell admin-table-header-cell">Admin</div>
                <div className="admin-table-cell admin-table-header-cell">Target</div>
                <div className="admin-table-cell admin-table-header-cell">Description</div>
                <div className="admin-table-cell admin-table-header-cell">Date & Time</div>
              </div>
            </div>
            
            <div className="admin-table-body">
              {auditLogs.length > 0 ? (
                auditLogs.map((log, index) => (
                  <div key={log._id || index} className="admin-table-row">
                    <div className="admin-table-cell">
                      <span className={`admin-action-badge ${getActionColor(log.action)}`}>
                        <span className="admin-action-icon">{getActionIcon(log.action)}</span>
                        {log.action}
                      </span>
                    </div>
                    <div className="admin-table-cell">
                      <div className="admin-admin-info">
                        <span className="admin-admin-username">{log.adminUsername}</span>
                        {log.admin?.name && (
                          <span className="admin-admin-name"> ({log.admin.name})</span>
                        )}
                      </div>
                    </div>
                    <div className="admin-table-cell">
                      <span className="admin-target-type-badge">{log.targetType}</span>
                    </div>
                    <div className="admin-table-cell">
                      <div className="admin-description" title={log.description}>
                        {log.description}
                      </div>
                    </div>
                    <div className="admin-table-cell">
                      <div className="admin-date-time-box">
                        {formatDate(log.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="admin-table-row">
                  <div className="admin-table-cell admin-no-records" colSpan="5">
                    No audit logs found matching the current filters
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {pagination.pages > 1 && (
          <div className="admin-pagination">
            <button
              className="admin-pagination-btn"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </button>
            
            <div className="admin-pagination-info">
              Page {pagination.page} of {pagination.pages}
            </div>
            
            <button
              className="admin-pagination-btn"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
            >
              Next
            </button>
          </div>
        )}
      </div>
  );
};

export default SystemAuditLogs;
