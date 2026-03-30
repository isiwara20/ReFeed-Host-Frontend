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
            <span className="admin-detail-icon">📧</span>
            {ngo.ngoId?.email || 'No email'}
          </div>
          <div className="admin-user-detail">
            <span className="admin-detail-icon">👤</span>
            @{ngo.ngoId?.username || 'no-username'}
          </div>
          <div className="admin-user-detail">
            <span className="admin-detail-icon">📅</span>
            Applied {formatDate(ngo.createdAt)}
          </div>
        </div>
        
        <div className="admin-verification-documents">
          <div className="admin-document-badge">
            <span className="admin-document-icon">📄</span>
            Registration Certificate
          </div>
          <div className="admin-document-badge">
            <span className="admin-document-icon">📋</span>
            Tax Documents
          </div>
          <div className="admin-document-badge">
            <span className="admin-document-icon">🏢</span>
            Address Proof
          </div>
        </div>
        
        <div className="admin-user-status pending">
          <span className="admin-detail-icon">⏳</span>
          Pending Verification
        </div>
      </div>
      
      <div className="admin-verification-actions">
        <button 
          className="admin-action-button view"
          onClick={() => console.log('View documents for NGO:', ngo._id)}
        >
          <span>👁️</span>
          View Documents
        </button>
        <button 
          className="admin-action-button approve"
          onClick={() => handleApproveNgo(ngo._id)}
          disabled={actionLoading}
        >
          <span>✅</span>
          Approve
        </button>
        <button 
          className="admin-action-button reject"
          onClick={() => openRejectionModal('ngo', ngo._id)}
          disabled={actionLoading}
        >
          <span>❌</span>
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
            <span className="admin-detail-icon">📧</span>
            {donor.email || 'No email'}
          </div>
          <div className="admin-user-detail">
            <span className="admin-detail-icon">📱</span>
            {donor.phone || 'No phone'}
          </div>
          <div className="admin-user-detail">
            <span className="admin-detail-icon">📅</span>
            Applied {formatDate(donor.createdAt)}
          </div>
        </div>
        
        <div className="admin-verification-documents">
          <div className="admin-document-badge">
            <span className="admin-document-icon">🆔</span>
            ID Verification
          </div>
          <div className="admin-document-badge">
            <span className="admin-document-icon">📍</span>
            Address Proof
          </div>
        </div>
        
        <div className="admin-user-status pending">
          <span className="admin-detail-icon">⏳</span>
          Pending Verification
        </div>
      </div>
      
      <div className="admin-verification-actions">
        <button 
          className="admin-action-button view"
          onClick={() => console.log('View documents for donor:', donor._id)}
        >
          <span>👁️</span>
          View Documents
        </button>
        <button 
          className="admin-action-button approve"
          onClick={() => handleApproveDonor(donor._id)}
          disabled={actionLoading}
        >
          <span>✅</span>
          Approve
        </button>
        <button 
          className="admin-action-button reject"
          onClick={() => openRejectionModal('donor', donor._id)}
          disabled={actionLoading}
        >
          <span>❌</span>
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
          <span className="admin-tab-icon">🏢</span>
          NGO Organizations
          <span className="admin-tab-count">{pendingNgos.length}</span>
        </button>
        <button 
          className={`admin-tab-button ${activeTab === 'donors' ? 'active' : ''}`}
          onClick={() => setActiveTab('donors')}
        >
          <span className="admin-tab-icon">🤝</span>
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
              <div className="admin-empty-icon">🏢</div>
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
              <div className="admin-empty-icon">🤝</div>
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
    </div>
  );
};

export default UserVerification;
