//Sewni

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import './AdminProfile.css';

const AdminProfile = ({ adminData, setActivePage, onProfileUpdate }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    profilepic: '',
    nic: '',
    gender: '',
    bio: '',
    dateOfBirth: ''
  });
  
  const [profilePicFile, setProfilePicFile] = useState(null);
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const userData = currentUser || adminData;
      if (userData && userData.username) {
        const response = await apiClient.get(`/admin/profile/${userData.username}`);
        if (response) {
          setProfileData(response);
          setFormData({
            username: response.username || '',
            name: response.name || '',
            email: response.email || '',
            phone: response.phone || '',
            profilepic: response.profile?.profilepic || '',
            nic: response.profile?.nic || '',
            gender: response.profile?.gender || '',
            bio: response.profile?.bio || '',
            dateOfBirth: response.profile?.dateOfBirth ? 
              new Date(response.profile.dateOfBirth).toISOString().split('T')[0] : ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      
      // Create preview URL for immediate display
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profilepic: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.nic && formData.nic.length < 10) {
      newErrors.nic = 'NIC must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        adminData: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        profileData: {
          profilepic: formData.profilepic,
          nic: formData.nic,
          gender: formData.gender,
          bio: formData.bio,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null
        }
      };

      console.log('Sending update data:', updateData);
      const response = await apiClient.put(`/admin/profile/${formData.username}`, updateData);
      
      console.log('Backend response:', response);
      if (response.data) {
        setProfileData(response.data);
        setSubmitSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSubmitSuccess(false), 3000);
        
        // Call callback to update parent adminData
        if (onProfileUpdate) {
          onProfileUpdate(response.data);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error status:', error.status);
      console.error('Error data:', error.data);
      console.error('Error message:', error.message);
      setErrors({ submit: `Failed to update profile: ${error.message || 'Please try again.'}` });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profileData) {
      setFormData({
        username: profileData.username || '',
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        profilepic: profileData.profile?.profilepic || '',
        nic: profileData.profile?.nic || '',
        gender: profileData.profile?.gender || '',
        bio: profileData.profile?.bio || '',
        dateOfBirth: profileData.profile?.dateOfBirth ? 
          new Date(profileData.profile.dateOfBirth).toISOString().split('T')[0] : ''
      });
    }
  };

  const handleBack = () => {
    setActivePage && setActivePage('dashboard');
  };

  if (!profileData) {
    return (
      <div className="admin-profile-content">
        <div className="admin-profile-loading">
          <div className="admin-loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-profile-content">
      <div className="admin-profile-container">
        <div className="admin-profile-header">
          <button className="admin-back-btn" onClick={handleBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Dashboard
          </button>
          <h1 className="admin-profile-title">Admin Profile</h1>
        </div>

        {submitSuccess && (
          <div className="admin-success-message">
            <div className="admin-success-icon">✓</div>
            <span>Profile updated successfully!</span>
          </div>
        )}

        <div className="admin-profile-box">
          {/* Left Panel - Information */}
          <div className="admin-profile-left">
            <div className="admin-right-content">
              <div className="admin-right-header">
                <div className="admin-right-icon">👤</div>
                <h2 className="admin-right-title">Profile Overview</h2>
                <p className="admin-right-subtitle">
                  Manage your administrator identity and preferences
                </p>
              </div>

              <div className="admin-profile-summary">
                <div className="admin-profile-avatar">
                  {formData.profilepic ? (
                    <img 
                      src={formData.profilepic} 
                      alt={formData.name}
                      className="admin-profile-img"
                    />
                  ) : (
                    <div className="admin-avatar-placeholder">
                      {formData.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                  )}
                </div>
                <h2>{formData.name}</h2>
                <p className="admin-profile-username">@{formData.username}</p>
                <p className="admin-profile-role">System Administrator</p>
              </div>

              <div className="admin-features">
                <div className="admin-feature">
                  <div className="admin-feature-icon">🔐</div>
                  <div className="admin-feature-content">
                    <h3>Account Security</h3>
                    <p>Your credentials and access permissions</p>
                  </div>
                </div>
                <div className="admin-feature">
                  <div className="admin-feature-icon">📊</div>
                  <div className="admin-feature-content">
                    <h3>System Analytics</h3>
                    <p>Access to comprehensive dashboard data</p>
                  </div>
                </div>
                <div className="admin-feature">
                  <div className="admin-feature-icon">⚙️</div>
                  <div className="admin-feature-content">
                    <h3>Admin Controls</h3>
                    <p>Full system management capabilities</p>
                  </div>
                </div>
                <div className="admin-feature">
                  <div className="admin-feature-icon">🛡️</div>
                  <div className="admin-feature-content">
                    <h3>Privacy Settings</h3>
                    <p>Control your profile visibility</p>
                  </div>
                </div>
              </div>

              <div className="admin-security-note">
                <div className="admin-security-icon">🔒</div>
                <div className="admin-security-content">
                  <h4>Profile Security</h4>
                  <p>Keep your profile information updated and secure. Regular maintenance ensures optimal system access.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Profile Form */}
          <div className="admin-profile-right">
            <div className="admin-registration-header">
              <div className="admin-logo">
                <span className="admin-logo-main">Re</span><span className="admin-logo-accent">Feed</span>
              </div>
              <h1 className="admin-registration-title">Profile Settings</h1>
              <p className="admin-registration-subtitle">
                Manage your administrator account information
              </p>
            </div>

            <div className="admin-profile-form-container">
              <div className="admin-profile-form-header">
                <h3>Account Information</h3>
              </div>

              <form className="admin-profile-form" onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                {/* Profile Picture */}
                <div className="admin-form-group full-width">
                  <label className="admin-form-label" htmlFor="profilepic">
                    Profile Picture
                  </label>
                  <div className="admin-profile-upload-section">
                    <div className="admin-profile-avatar">
                      {formData.profilepic ? (
                        <img 
                          src={formData.profilepic} 
                          alt={formData.name}
                          className="admin-profile-img"
                        />
                      ) : (
                        <div className="admin-avatar-placeholder">
                          {formData.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <div className="admin-upload-controls">
                        <label className="admin-upload-btn">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                          Change Photo
                          <input
                            type="file"
                            name="profilepic"
                            accept="image/*"
                            onChange={handleProfilePicChange}
                            className="admin-upload-input"
                          />
                        </label>
                        <p className="admin-upload-hint">JPG, PNG or GIF. Max size 2MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Username (Read-only) */}
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="username">
                    Username
                  </label>
                  <div className="admin-input-wrapper">
                    <div className="admin-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      className="admin-form-input readonly"
                      readOnly
                    />
                  </div>
                </div>

                {/* Name */}
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="name">
                    Full Name <span className="admin-required">*</span>
                  </label>
                  <div className={`admin-input-wrapper ${errors.name ? 'error' : ''}`}>
                    <div className="admin-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`admin-form-input ${!isEditing ? 'readonly' : ''}`}
                      readOnly={!isEditing}
                      placeholder="Enter full name"
                    />
                  </div>
                  {errors.name && (
                    <div className="admin-error-message">{errors.name}</div>
                  )}
                </div>

                {/* Email */}
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="email">
                    Email Address <span className="admin-required">*</span>
                  </label>
                  <div className={`admin-input-wrapper ${errors.email ? 'error' : ''}`}>
                    <div className="admin-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="m22 7-10 5L2 7"/>
                      </svg>
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`admin-form-input ${!isEditing ? 'readonly' : ''}`}
                      readOnly={!isEditing}
                      placeholder="admin@example.com"
                    />
                  </div>
                  {errors.email && (
                    <div className="admin-error-message">{errors.email}</div>
                  )}
                </div>

                {/* Phone */}
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="phone">
                    Phone Number <span className="admin-required">*</span>
                  </label>
                  <div className={`admin-input-wrapper ${errors.phone ? 'error' : ''}`}>
                    <div className="admin-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                        <line x1="12" y1="18" x2="12.01" y2="18"/>
                      </svg>
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`admin-form-input ${!isEditing ? 'readonly' : ''}`}
                      readOnly={!isEditing}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  {errors.phone && (
                    <div className="admin-error-message">{errors.phone}</div>
                  )}
                </div>

                {/* NIC */}
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="nic">
                    NIC Number
                  </label>
                  <div className={`admin-input-wrapper ${errors.nic ? 'error' : ''}`}>
                    <div className="admin-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                        <line x1="8" y1="21" x2="16" y2="21"/>
                        <line x1="12" y1="17" x2="12" y2="21"/>
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="nic"
                      name="nic"
                      value={formData.nic}
                      onChange={handleChange}
                      className={`admin-form-input ${!isEditing ? 'readonly' : ''}`}
                      readOnly={!isEditing}
                      placeholder="Enter NIC number"
                    />
                  </div>
                  {errors.nic && (
                    <div className="admin-error-message">{errors.nic}</div>
                  )}
                </div>

                {/* Gender */}
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="gender">
                    Gender
                  </label>
                  <div className="admin-input-wrapper">
                    <div className="admin-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={`admin-form-input ${!isEditing ? 'readonly' : ''}`}
                      disabled={!isEditing}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="dateOfBirth">
                    Date of Birth
                  </label>
                  <div className="admin-input-wrapper">
                    <div className="admin-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </div>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className={`admin-form-input ${!isEditing ? 'readonly' : ''}`}
                      readOnly={!isEditing}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="admin-form-group full-width">
                  <label className="admin-form-label" htmlFor="bio">
                    Bio <span className="admin-optional">Optional</span>
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className={`admin-form-textarea ${!isEditing ? 'readonly' : ''}`}
                    readOnly={!isEditing}
                    placeholder="Tell us about your role and experience..."
                    rows="4"
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      overflowWrap: 'break-word',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}
                  />
                </div>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="admin-submit-error">
                  <div className="admin-error-icon">⚠</div>
                  <div className="admin-error-text">{errors.submit}</div>
                </div>
              )}
            </form>
            
            {/* Form Actions - Bottom */}
            <div className="admin-profile-form-actions">
              {!isEditing ? (
                <button 
                  className="admin-edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit Profile
                </button>
              ) : (
                <div className="admin-form-actions">
                  <button 
                    className="admin-btn admin-btn-back"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    className="admin-btn admin-btn-primary"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="admin-spinner"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
