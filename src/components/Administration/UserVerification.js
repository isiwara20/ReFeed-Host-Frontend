//Sewni

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from "../../context/AuthContext";
import { apiClient } from '../../api/client';
import './UserVerification.css';

const UserVerification = ({ adminData }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('ngos');
  const [pendingNgos, setPendingNgos] = useState([]);
  const [pendingDonors, setPendingDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectionModal, setRejectionModal] = useState({
    isOpen: false,
    type: null,
    id: null,
    reason: ''
  });
  const [documentModal, setDocumentModal] = useState({ isOpen: false, type: '', data: null });
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch pending NGOs
  const fetchPendingNgos = useCallback(async () => {
    try {
      const userData = currentUser || adminData;
      if (userData && userData.username) {
        const response = await apiClient.get("/admin/verification/ngos/pending", {
          headers: {
            'username': userData.username
          }
        });
        setPendingNgos(response || []);
      }
    } catch (error) {
      console.error('Error fetching pending NGOs:', error);
      setError(error.message);
    }
  }, [currentUser, adminData]);

  // Fetch pending Donors
  const fetchPendingDonors = useCallback(async () => {
    try {
      const userData = currentUser || adminData;
      if (userData && userData.username) {
        const response = await apiClient.get("/admin/verification/donors/pending", {
          headers: {
            'username': userData.username
          }
        });
        setPendingDonors(response || []);
      }
    } catch (error) {
      console.error('Error fetching pending donors:', error);
      setError(error.message);
    }
  }, [currentUser, adminData]);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchPendingNgos(), fetchPendingDonors()]);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchPendingNgos, fetchPendingDonors]);

  // Approve NGO
  const handleApproveNgo = async (ngoId) => {
    setActionLoading(true);
    try {
      const userData = currentUser || adminData;
      await apiClient.patch(`/admin/verification/ngos/${ngoId}/approve`, {}, {
        headers: {
          'username': userData.username
        }
      });
      
      // Refresh the list
      await fetchPendingNgos();
    } catch (error) {
      console.error('Error approving NGO:', error);
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Approve Donor
  const handleApproveDonor = async (donorId) => {
    setActionLoading(true);
    try {
      const userData = currentUser || adminData;
      await apiClient.patch(`/admin/verification/donors/${donorId}/approve`, {}, {
        headers: {
          'username': userData.username
        }
      });
      
      // Refresh the list
      await fetchPendingDonors();
    } catch (error) {
      console.error('Error approving donor:', error);
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Reject NGO
  const handleRejectNgo = async (ngoId, reason) => {
    setActionLoading(true);
    try {
      const userData = currentUser || adminData;
      await apiClient.patch(`/admin/verification/ngos/${ngoId}/reject`, { reason }, {
        headers: {
          'username': userData.username
        }
      });
      
      // Refresh the list
      await fetchPendingNgos();
      closeRejectionModal();
    } catch (error) {
      console.error('Error rejecting NGO:', error);
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Reject Donor
  const handleRejectDonor = async (donorId, reason) => {
    setActionLoading(true);
    try {
      const userData = currentUser || adminData;
      await apiClient.patch(`/admin/verification/donors/${donorId}/reject`, { reason }, {
        headers: {
          'username': userData.username
        }
      });
      
      // Refresh the list
      await fetchPendingDonors();
      closeRejectionModal();
    } catch (error) {
      console.error('Error rejecting donor:', error);
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Open rejection modal
  const openRejectionModal = (type, id) => {
    setRejectionModal({
      isOpen: true,
      type,
      id,
      reason: ''
    });
  };

  // Close rejection modal
  const closeRejectionModal = () => {
    setRejectionModal({
      isOpen: false,
      type: null,
      id: null,
      reason: ''
    });
  };

  // Open document modal
  const openDocumentModal = (type, data) => {
    setDocumentModal({
      isOpen: true,
      type,
      data
    });
  };

  // Close document modal
  const closeDocumentModal = () => {
    setDocumentModal({
      isOpen: false,
      type: null,
      data: null
    });
  };

  // Handle rejection confirmation
  const handleRejectionConfirm = () => {
    if (!rejectionModal.reason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    if (rejectionModal.type === 'ngo') {
      handleRejectNgo(rejectionModal.id, rejectionModal.reason);
    } else if (rejectionModal.type === 'donor') {
      handleRejectDonor(rejectionModal.id, rejectionModal.reason);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Render NGO item
  const renderNgoItem = (ngo) => (
    <li key={ngo._id} className="admin-verification-item">
      <div className="admin-user-avatar">
        {ngo.ngoId?.name?.charAt(0).toUpperCase() || 'N'}
      </div>
      
      <div className="admin-user-info">
        <div className="admin-user-name">{ngo.ngoId?.name || 'Unknown NGO'}</div>
        
        <div className="admin-user-details">
          <div className="admin-user-detail">
            <span className="admin-detail-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </span>
            {ngo.ngoId?.email || 'No email'}
          </div>
          <div className="admin-user-detail">
            <span className="admin-detail-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18"/>
              </svg>
            </span>
            {ngo.ngoId?.phone || 'No phone'}
          </div>
          <div className="admin-user-detail">
            <span className="admin-detail-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </span>
            Applied {formatDate(ngo.createdAt)}
          </div>
        </div>
        
        <div className="admin-verification-documents">
          <div className="admin-document-badge">
            <span className="admin-document-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </span>
            Registration Certificate
          </div>
          <div className="admin-document-badge">
            <span className="admin-document-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11H3v2h6v-2zm0-4H3v2h6V7zm0 8H3v2h6v-2zm12-8h-6v2h6V7zm0 4h-6v2h6v-2zm0 4h-6v2h6v-2z"/>
              </svg>
            </span>
            Tax Documents
          </div>
          <div className="admin-document-badge">
            <span className="admin-document-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </span>
            Address Proof
          </div>
        </div>
        
        <div className="admin-user-status pending">
          <span className="admin-detail-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
          </span>
          Pending Verification
        </div>
      </div>
      
      <div className="admin-verification-actions">
        <button 
          className="admin-action-button view"
          onClick={() => openDocumentModal('ngo', ngo)}
        >
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </span>
          View Documents
        </button>
        <button 
          className="admin-action-button approve"
          onClick={() => handleApproveNgo(ngo._id)}
          disabled={actionLoading}
        >
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </span>
          Approve
        </button>
        <button 
          className="admin-action-button reject"
          onClick={() => openRejectionModal('ngo', ngo._id)}
          disabled={actionLoading}
        >
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </span>
          Reject
        </button>
      </div>
    </li>
  );

  // Render Donor item
  const renderDonorItem = (donor) => (
    <li key={donor._id} className="admin-verification-item">
      <div className="admin-user-avatar">
        {donor.name?.charAt(0).toUpperCase() || 'D'}
      </div>
      
      <div className="admin-user-info">
        <div className="admin-user-name">{donor.name || 'Unknown Donor'}</div>
        
        <div className="admin-user-details">
          <div className="admin-user-detail">
            <span className="admin-detail-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </span>
            {donor.email || 'No email'}
          </div>
          <div className="admin-user-detail">
            <span className="admin-detail-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18"/>
              </svg>
            </span>
            {donor.phone || 'No phone'}
          </div>
          <div className="admin-user-detail">
            <span className="admin-detail-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </span>
            Applied {formatDate(donor.createdAt)}
          </div>
        </div>
        
        <div className="admin-verification-documents">
          <div className="admin-document-badge">
            <span className="admin-document-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="16" y="3" width="4" height="4"/>
                <rect x="8" y="3" width="4" height="4"/>
                <rect x="16" y="8" width="4" height="4"/>
                <rect x="8" y="8" width="4" height="4"/>
                <rect x="16" y="13" width="4" height="4"/>
                <rect x="8" y="13" width="4" height="4"/>
                <rect x="4" y="17" width="16" height="4"/>
              </svg>
            </span>
            ID Verification
          </div>
          <div className="admin-document-badge">
            <span className="admin-document-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </span>
            Address Proof
          </div>
        </div>
        
        <div className="admin-user-status pending">
          <span className="admin-detail-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
          </span>
          Pending Verification
        </div>
      </div>
      
      <div className="admin-verification-actions">
        <button 
          className="admin-action-button view"
          onClick={() => openDocumentModal('donor', donor)}
        >
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </span>
          View Documents
        </button>
        <button 
          className="admin-action-button approve"
          onClick={() => handleApproveDonor(donor._id)}
          disabled={actionLoading}
        >
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </span>
          Approve
        </button>
        <button 
          className="admin-action-button reject"
          onClick={() => openRejectionModal('donor', donor._id)}
          disabled={actionLoading}
        >
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </span>
          Reject
        </button>
      </div>
    </li>
  );

  if (loading) {
    return (
      <div className="admin-verification-container">
        <div className="admin-loading-state">
          <div className="admin-loading-spinner"></div>
          <p>Loading verification requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-verification-container">
        <div className="admin-error-state">
          <p className="admin-error-text">{error}</p>
          <button 
            className="admin-retry-button" 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-verification-container">
      {/* Header */}
      <div className="admin-verification-header">
        <h1 className="admin-verification-title">User & Organization Verification</h1>
        <p className="admin-verification-subtitle">
          Review and verify pending NGO and donor registration applications
        </p>
      </div>

      {/* Tabs */}
      <div className="admin-verification-tabs">
        <button 
          className={`admin-tab-button ${activeTab === 'ngos' ? 'active' : ''}`}
          onClick={() => setActiveTab('ngos')}
        >
          <span className="admin-tab-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </span>
          NGO Organizations
          <span className="admin-tab-count">{pendingNgos.length}</span>
        </button>
        <button 
          className={`admin-tab-button ${activeTab === 'donors' ? 'active' : ''}`}
          onClick={() => setActiveTab('donors')}
        >
          <span className="admin-tab-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </span>
          Donor Applications
          <span className="admin-tab-count">{pendingDonors.length}</span>
        </button>
      </div>

      {/* Content */}
      <div className="admin-verification-content">
        {activeTab === 'ngos' ? (
          pendingNgos.length > 0 ? (
            <ul className="admin-verification-list">
              {pendingNgos.map(renderNgoItem)}
            </ul>
          ) : (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </div>
              <h3 className="admin-empty-title">No Pending NGO Verifications</h3>
              <p className="admin-empty-description">
                All NGO organizations have been verified. New verification requests will appear here.
              </p>
            </div>
          )
        ) : (
          pendingDonors.length > 0 ? (
            <ul className="admin-verification-list">
              {pendingDonors.map(renderDonorItem)}
            </ul>
          ) : (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
              </div>
              <h3 className="admin-empty-title">No Pending Donor Verifications</h3>
              <p className="admin-empty-description">
                All donor applications have been verified. New verification requests will appear here.
              </p>
            </div>
          )
        )}
      </div>

      {/* Rejection Modal */}
      {rejectionModal.isOpen && (
        <div className="admin-rejection-modal-overlay">
          <div className="admin-rejection-modal">
            <h2 className="admin-modal-title">Reject Application</h2>
            <p className="admin-modal-description">
              Please provide a reason for rejecting this {rejectionModal.type === 'ngo' ? 'NGO' : 'donor'} application.
            </p>
            
            <textarea
              className="admin-reason-textarea"
              placeholder="Enter rejection reason..."
              value={rejectionModal.reason}
              onChange={(e) => setRejectionModal(prev => ({
                ...prev,
                reason: e.target.value
              }))}
              autoFocus
            />
            
            <div className="admin-modal-actions">
              <button 
                className="admin-modal-button cancel"
                onClick={closeRejectionModal}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                className="admin-modal-button confirm"
                onClick={handleRejectionConfirm}
                disabled={actionLoading}
              >
                {actionLoading ? 'Rejecting...' : 'Reject Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Modal */}
      {documentModal.isOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {documentModal.type === 'ngo' ? 'NGO Documents' : 'Donor Documents'}
              </h3>
              <button className="admin-modal-close" onClick={closeDocumentModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="admin-modal-content">
              <div className="admin-document-viewer">
                {documentModal.type === 'ngo' ? (
                  <>
                    <div className="admin-document-section">
                      <h4>NGO Information</h4>
                      <div className="admin-info-grid">
                        <div className="admin-info-item">
                          <strong>Organization Name:</strong> {documentModal.data?.ngoId?.name}
                        </div>
                        <div className="admin-info-item">
                          <strong>Email:</strong> {documentModal.data?.ngoId?.email}
                        </div>
                        <div className="admin-info-item">
                          <strong>Username:</strong> @{documentModal.data?.ngoId?.username}
                        </div>
                        <div className="admin-info-item">
                          <strong>Registration Number:</strong> {documentModal.data?.registrationNumber}
                        </div>
                        <div className="admin-info-item">
                          <strong>Registration Authority:</strong> {documentModal.data?.registrationAuthority}
                        </div>
                        <div className="admin-info-item">
                          <strong>Official Address:</strong> {documentModal.data?.officialAddress}
                        </div>
                        <div className="admin-info-item">
                          <strong>District:</strong> {documentModal.data?.district || 'Not specified'}
                        </div>
                        <div className="admin-info-item">
                          <strong>Province:</strong> {documentModal.data?.province || 'Not specified'}
                        </div>
                        <div className="admin-info-item">
                          <strong>Contact Person:</strong> {documentModal.data?.contactPersonName}
                        </div>
                        <div className="admin-info-item">
                          <strong>Contact Person NIC:</strong> {documentModal.data?.contactPersonNIC || 'Not provided'}
                        </div>
                        <div className="admin-info-item">
                          <strong>Contact Person Role:</strong> {documentModal.data?.contactPersonRole || 'Not specified'}
                        </div>
                        <div className="admin-info-item">
                          <strong>Status:</strong> {documentModal.data?.status}
                        </div>
                        <div className="admin-info-item">
                          <strong>Documents Checked:</strong> {documentModal.data?.documentChecked ? 'Yes' : 'No'}
                        </div>
                        <div className="admin-info-item">
                          <strong>Background Checked:</strong> {documentModal.data?.backgroundChecked ? 'Yes' : 'No'}
                        </div>
                        <div className="admin-info-item">
                          <strong>Site Visited:</strong> {documentModal.data?.siteVisited ? 'Yes' : 'No'}
                        </div>
                        <div className="admin-info-item">
                          <strong>Applied Date:</strong> {formatDate(documentModal.data?.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="admin-document-section">
                      <h4>Registration Certificate</h4>
                      <div className="admin-document-placeholder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14,2 14,8 20,8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <polyline points="10,9 9,9 8,9"/>
                        </svg>
                        <p>
                          {documentModal.data?.registrationDocumentUrl 
                            ? 'Registration certificate document available' 
                            : 'No registration certificate uploaded'}
                        </p>
                        {documentModal.data?.registrationDocumentUrl && (
                          <button 
                            className="admin-download-btn"
                            onClick={() => window.open(documentModal.data.registrationDocumentUrl, '_blank')}
                          >
                            View Document
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="admin-document-section">
                    <h4>Donor Information</h4>
                    <div className="admin-info-grid">
                      <div className="admin-info-item">
                        <strong>Name:</strong> {documentModal.data?.name}
                      </div>
                      <div className="admin-info-item">
                        <strong>Email:</strong> {documentModal.data?.email}
                      </div>
                      <div className="admin-info-item">
                        <strong>Username:</strong> @{documentModal.data?.username}
                      </div>
                      <div className="admin-info-item">
                        <strong>Phone:</strong> {documentModal.data?.phone}
                      </div>
                      <div className="admin-info-item">
                        <strong>Business Reg Number:</strong> {documentModal.data?.businessRegNumber || 'Not provided'}
                      </div>
                      <div className="admin-info-item">
                        <strong>NIC Number:</strong> {documentModal.data?.nicNumber || 'Not provided'}
                      </div>
                      <div className="admin-info-item">
                        <strong>Verification Status:</strong> {documentModal.data?.verificationStatus}
                      </div>
                      <div className="admin-info-item">
                        <strong>Applied Date:</strong> {formatDate(documentModal.data?.createdAt)}
                      </div>
                      <div className="admin-info-item">
                        <strong>Last Updated:</strong> {formatDate(documentModal.data?.updatedAt)}
                      </div>
                      {documentModal.data?.profileImage && (
                        <div className="admin-info-item">
                          <strong>Profile Image:</strong>
                          <div className="admin-profile-image-container">
                            <img 
                              src={documentModal.data.profileImage} 
                              alt="Profile" 
                              className="admin-profile-image"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserVerification;
