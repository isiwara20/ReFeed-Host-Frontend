//Sewni

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from "../../context/AuthContext";
import { apiClient } from '../../api/client';
import './DonationOversight.css';

const DonationOversight = ({ adminData }) => {
  const { currentUser } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'RESERVED', label: 'Reserved' },
    { value: 'COLLECTED', label: 'Collected' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'EXPIRED', label: 'Expired' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  const foodTypeIcons = {
    'veg': '🥬',
    'cooked': '🍛',
    'packed': '📦',
    'bakery': '🍞',
    'mixed': '🍱',
    'dairy': '🥛',
    'non-veg': '🍗'
  };

  const statusColors = {
    'DRAFT': '#94a3b8',
    'PUBLISHED': '#10b981',
    'RESERVED': '#f59e0b',
    'COLLECTED': '#3b82f6',
    'COMPLETED': '#059669',
    'EXPIRED': '#ef4444',
    'CANCELLED': '#6b7280'
  };

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (currentUser && currentUser.username) {
        const params = new URLSearchParams();
        if (statusFilter) params.append('lifecycleStatus', statusFilter);
        
        const response = await apiClient.get(`/admin/donations?${params.toString()}`, {
          headers: {
            'username': currentUser.username
          }
        });
        
        setDonations(response || []);
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  }, [currentUser, statusFilter]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleViewDetails = (donation) => {
    setSelectedDonation(donation);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedDonation(null);
  };

  
  const filteredDonations = donations.filter(donation => {
    if (searchTerm) {
      return (
        donation.donorUsername?.toLowerCase().includes(searchTerm) ||
        donation.foodType?.toLowerCase().includes(searchTerm) ||
        donation.location?.address?.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatQuantity = (quantity) => {
    return `${quantity.amount} ${quantity.unit}`;
  };

  const isExpired = (expiryTime) => {
    return new Date(expiryTime) < new Date();
  };

  if (loading) {
    return (
      <div className="donation-oversight-loading">
        <div className="donation-loading-spinner"></div>
        <p className="donation-loading-text">Loading donations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="donation-oversight-error">
        <p className="donation-error-text">{error}</p>
        <button className="donation-retry-btn" onClick={fetchDonations}>Retry</button>
      </div>
    );
  }

  return (
    <div className="donation-oversight">
      <div className="donation-oversight-header">
        <h1 className="donation-oversight-title">Donation Oversight</h1>
        <p className="donation-oversight-subtitle">Monitor and manage all food donations in the system</p>
      </div>

      <div className="donation-stats-grid">
        <div className="donation-stat-card">
          <div className="donation-stat-header">
            <div className="donation-stat-title">Total Donations</div>
            <div className="donation-stat-icon">📦</div>
          </div>
          <div className="donation-stat-value">{donations.length}</div>
          <p className="donation-stat-description">All donations in system</p>
        </div>
        
        <div className="donation-stat-card">
          <div className="donation-stat-header">
            <div className="donation-stat-title">Active Donations</div>
            <div className="donation-stat-icon">🟢</div>
          </div>
          <div className="donation-stat-value">
            {donations.filter(d => ['PUBLISHED', 'RESERVED'].includes(d.lifecycleStatus)).length}
          </div>
          <p className="donation-stat-description">Currently available</p>
        </div>
        
        <div className="donation-stat-card">
          <div className="donation-stat-header">
            <div className="donation-stat-title">Expired Items</div>
            <div className="donation-stat-icon">⚠️</div>
          </div>
          <div className="donation-stat-value">
            {donations.filter(d => isExpired(d.expiryTime) && d.lifecycleStatus !== 'EXPIRED').length}
          </div>
          <p className="donation-stat-description">Need attention</p>
        </div>
        
        <div className="donation-stat-card">
          <div className="donation-stat-header">
            <div className="donation-stat-title">Completed Today</div>
            <div className="donation-stat-icon">✅</div>
          </div>
          <div className="donation-stat-value">
            {donations.filter(d => {
              const today = new Date().toDateString();
              const donationDate = new Date(d.updatedAt).toDateString();
              return d.lifecycleStatus === 'COMPLETED' && today === donationDate;
            }).length}
          </div>
          <p className="donation-stat-description">Successfully collected</p>
        </div>
      </div>

      <div className="donation-filters">
        <div className="donation-filter-group">
          <label className="donation-filter-label">Status Filter:</label>
          <select 
            className="donation-filter-select"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="donation-filter-group">
          <label className="donation-filter-label">Search:</label>
          <input
            type="text"
            className="donation-search-input"
            placeholder="Search by donor, food type, or location..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="donation-table-container">
        <div className="donation-table-header">
          <h2 className="donation-table-title">Donation List</h2>
          <div className="donation-table-info">
            Showing {filteredDonations.length} of {donations.length} donations
          </div>
        </div>
        
        <div className="donation-table-wrapper">
          <table className="donation-table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Food Type</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Expiry Time</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.map((donation) => (
                <tr key={donation._id} className="donation-table-row">
                  <td className="donation-donor-cell">
                    <div className="donation-donor-info">
                      <div className="donation-donor-name">{donation.donorUsername}</div>
                    </div>
                  </td>
                  <td className="donation-food-type-cell">
                    <div className="donation-food-type">
                      <span className="donation-food-icon">
                        {foodTypeIcons[donation.foodType] || '🍽️'}
                      </span>
                      <span className="donation-food-label">{donation.foodType}</span>
                    </div>
                  </td>
                  <td className="donation-quantity-cell">
                    {formatQuantity(donation.quantity)}
                  </td>
                  <td className="donation-status-cell">
                    <span 
                      className="donation-status-badge"
                      style={{ backgroundColor: statusColors[donation.lifecycleStatus] }}
                    >
                      {donation.lifecycleStatus}
                    </span>
                  </td>
                  <td className="donation-expiry-cell">
                    <div className={`donation-expiry ${isExpired(donation.expiryTime) ? 'expired' : ''}`}>
                      {formatDate(donation.expiryTime)}
                    </div>
                  </td>
                  <td className="donation-location-cell">
                    <div className="donation-location">
                      {donation.location?.address || 'No address'}
                    </div>
                  </td>
                  <td className="donation-actions-cell">
                    <button 
                      className="donation-action-btn donation-view-btn"
                      onClick={() => handleViewDetails(donation)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showDetailsModal && selectedDonation && (
        <div className="donation-modal-overlay">
          <div className="donation-modal">
            <div className="donation-modal-header">
              <h3 className="donation-modal-title">Donation Details</h3>
              <button className="donation-modal-close" onClick={handleCloseModal}>×</button>
            </div>
            
            <div className="donation-modal-content">
              <div className="donation-detail-section">
                <h4 className="donation-detail-title">Basic Information</h4>
                <div className="donation-detail-grid">
                  <div className="donation-detail-item">
                    <label>Donor:</label>
                    <span>{selectedDonation.donorUsername}</span>
                  </div>
                  <div className="donation-detail-item">
                    <label>Food Type:</label>
                    <span>{selectedDonation.foodType}</span>
                  </div>
                  <div className="donation-detail-item">
                    <label>Quantity:</label>
                    <span>{formatQuantity(selectedDonation.quantity)}</span>
                  </div>
                  <div className="donation-detail-item">
                    <label>Current Status:</label>
                    <span 
                      className="donation-status-badge"
                      style={{ backgroundColor: statusColors[selectedDonation.lifecycleStatus] }}
                    >
                      {selectedDonation.lifecycleStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="donation-detail-section">
                <h4 className="donation-detail-title">Time Information</h4>
                <div className="donation-detail-grid">
                  <div className="donation-detail-item">
                    <label>Expiry Time:</label>
                    <span className={isExpired(selectedDonation.expiryTime) ? 'expired-text' : ''}>
                      {formatDate(selectedDonation.expiryTime)}
                    </span>
                  </div>
                  <div className="donation-detail-item">
                    <label>Pickup Window:</label>
                    <span>
                      {selectedDonation.pickupWindowStart && selectedDonation.pickupWindowEnd
                        ? `${formatDate(selectedDonation.pickupWindowStart)} - ${formatDate(selectedDonation.pickupWindowEnd)}`
                        : 'Not specified'
                      }
                    </span>
                  </div>
                  <div className="donation-detail-item">
                    <label>Created At:</label>
                    <span>{formatDate(selectedDonation.createdAt)}</span>
                  </div>
                  <div className="donation-detail-item">
                    <label>Last Updated:</label>
                    <span>{formatDate(selectedDonation.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="donation-detail-section">
                <h4 className="donation-detail-title">Location</h4>
                <div className="donation-detail-item">
                  <label>Address:</label>
                  <span>{selectedDonation.location?.address || 'No address provided'}</span>
                </div>
                {selectedDonation.location?.lat && selectedDonation.location?.lng && (
                  <div className="donation-detail-item">
                    <label>Coordinates:</label>
                    <span>{selectedDonation.location.lat}, {selectedDonation.location.lng}</span>
                  </div>
                )}
              </div>

              <div className="donation-detail-section">
                <h4 className="donation-detail-title">Additional Information</h4>
                <div className="donation-detail-item">
                  <label>Self Delivery:</label>
                  <span>{selectedDonation.selfDelivery ? 'Yes' : 'No'}</span>
                </div>
              </div>

                          </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationOversight;
