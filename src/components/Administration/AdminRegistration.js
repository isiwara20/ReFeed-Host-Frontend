//Sewni

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import './AdminRegistration.css';

const AdminRegistration = ({ adminData, setActivePage }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    phone: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Check username availability
  const checkUsernameAvailability = async (username) => {
    if (!username) {
      setUsernameAvailable(null);
      return;
    }

    if (username.length < 3) {
      setUsernameAvailable(false);
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await apiClient.get(`/admin/registration/check/${username}`);
      setUsernameAvailable(!response.exists);
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  // Debounced username check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.username) {
        checkUsernameAvailability(formData.username);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Reset username availability when username changes
    if (name === 'username') {
      setUsernameAvailable(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    } else if (usernameAvailable === false) {
      newErrors.username = 'Username is already taken';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Name validation
    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (required)
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
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
      const response = await apiClient.post('/admin/registration/register', formData, {
      authUser: {
        username: currentUser?.username,
        role: currentUser?.role || 'ADMIN'
      }
    });
      
      if (response.success) {
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          username: '',
          password: '',
          confirmPassword: '',
          name: '',
          email: '',
          phone: ''
        });
        setUsernameAvailable(null);
      } else {
        setErrors({ submit: response.message });
      }
    } catch (error) {
      console.error("Frontend registration error:", error);
      console.error("Error status:", error.status);
      console.error("Error data:", error.data);
      setErrors({ submit: error.response?.data?.message || error.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setActivePage && setActivePage('dashboard');
  };

  const handleLogout = () => {
    // Implement logout logic
    navigate('/admin-login');
  };

  if (submitSuccess) {
    return (
      <div className="admin-registration-content">
        <div className="admin-registration-container">
          <div className="admin-registration-success">
            <div className="admin-success-icon">✓</div>
            <h2 className="admin-success-title">Admin Registered Successfully!</h2>
            <p className="admin-success-message">
              The new administrator has been registered and can now access the system.
            </p>
            <div className="admin-success-actions">
              <button className="admin-success-btn primary" onClick={() => setActivePage && setActivePage('dashboard')}>
                Back to Dashboard
              </button>
              <button className="admin-success-btn secondary" onClick={() => {
                setSubmitSuccess(false);
                setFormData({
                  username: '',
                  password: '',
                  confirmPassword: '',
                  name: '',
                  email: '',
                  phone: ''
                });
              }}>
                Register Another Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-registration-content">
      <div className="admin-registration-container">
        <div className="admin-registration-box">
          {/* Left Panel - Registration Form */}
          <div className="admin-registration-left">
            <div className="admin-registration-header">
              <div className="admin-logo">
                <span className="admin-logo-main">Re</span><span className="admin-logo-accent">Feed</span>
              </div>
              <h1 className="admin-registration-title">Create Admin Account</h1>
              <p className="admin-registration-subtitle">
                Register a new administrator with system access privileges
              </p>
            </div>

          <div className="admin-registration-form-container">
            <form className="admin-registration-form" onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                {/* Full Name Field */}
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
                      className={`admin-form-input`}
                      placeholder="Enter full name"
                      disabled={loading}
                    />
                  </div>
                  {errors.name && (
                    <div className="admin-error-message">{errors.name}</div>
                  )}
                </div>

                {/* Username Field */}
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="username">
                    Username <span className="admin-required">*</span>
                  </label>
                  <div className={`admin-input-wrapper ${errors.username ? 'error' : ''} ${usernameAvailable === true ? 'success' : ''}`}>
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
                      onChange={handleChange}
                      className={`admin-form-input`}
                      placeholder="Choose username"
                      disabled={loading}
                    />
                    {checkingUsername && (
                      <div className="admin-input-status checking">Checking...</div>
                    )}
                    {usernameAvailable === true && (
                      <div className="admin-input-status available">✓ Available</div>
                    )}
                    {usernameAvailable === false && (
                      <div className="admin-input-status taken">✗ Taken</div>
                    )}
                  </div>
                  {errors.username && (
                    <div className="admin-error-message">{errors.username}</div>
                  )}
                </div>

                {/* Email Field */}
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="email">
                    Email Address <span className="admin-required">*</span>
                  </label>
                  <div className="admin-input-wrapper">
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
                      className={`admin-form-input`}
                      placeholder="admin@example.com"
                      disabled={loading}
                    />
                  </div>
                  {errors.email && (
                    <div className="admin-error-message">{errors.email}</div>
                  )}
                </div>

                {/* Phone Field */}
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="phone">
                    Phone Number <span className="admin-required">*</span>
                  </label>
                  <div className="admin-input-wrapper">
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
                      className={`admin-form-input`}
                      placeholder="+1 (555) 123-4567"
                      disabled={loading}
                    />
                  </div>
                  {errors.phone && (
                    <div className="admin-error-message">{errors.phone}</div>
                  )}
                </div>

                {/* Password Field */}
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="password">
                    Password <span className="admin-required">*</span>
                  </label>
                  <div className="admin-input-wrapper">
                    <div className="admin-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`admin-form-input`}
                      placeholder="Create strong password"
                      disabled={loading}
                    />
                  </div>
                  {errors.password && (
                    <div className="admin-error-message">{errors.password}</div>
                  )}
                  <div className="admin-password-requirements">
                    <div className="admin-requirements-title">Password must contain:</div>
                    <div className="admin-requirements-list">
                      <div className={`admin-requirement ${formData.password.length >= 6 ? 'met' : ''}`}>
                        ✓ 6+ characters
                      </div>
                      <div className={`admin-requirement ${/[a-z]/.test(formData.password) ? 'met' : ''}`}>
                        ✓ Lowercase letter
                      </div>
                      <div className={`admin-requirement ${/[A-Z]/.test(formData.password) ? 'met' : ''}`}>
                        ✓ Uppercase letter
                      </div>
                      <div className={`admin-requirement ${/\d/.test(formData.password) ? 'met' : ''}`}>
                        ✓ Number
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="confirmPassword">
                    Confirm Password <span className="admin-required">*</span>
                  </label>
                  <div className="admin-input-wrapper">
                    <div className="admin-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`admin-form-input`}
                      placeholder="Confirm password"
                      disabled={loading}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <div className="admin-error-message">{errors.confirmPassword}</div>
                  )}
                </div>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="admin-submit-error">
                  <div className="admin-error-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>
                  <div className="admin-error-text">{errors.submit}</div>
                </div>
              )}

              {/* Form Actions */}
              <div className="admin-form-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn-back"
                  onClick={handleBack}
                  disabled={loading}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12"/>
                    <polyline points="12 19 5 12 12 5"/>
                  </svg>
                  Back to Dashboard
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={loading || usernameAvailable === false}
                >
                  {loading ? (
                    <span className="admin-btn-loading">
                      <span className="admin-spinner"></span>
                      Creating Account...
                    </span>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="8.5" cy="7" r="4"/>
                        <line x1="20" y1="8" x2="20" y2="14"/>
                        <line x1="23" y1="11" x2="17" y2="11"/>
                      </svg>
                      Create Admin Account
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Panel - Information */}
        <div className="admin-registration-right">
          <div className="admin-right-content">
            <div className="admin-right-header">
              <div className="admin-right-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h2 className="admin-right-title">Admin Access</h2>
              <p className="admin-right-subtitle">
                Secure system administration with elevated privileges
              </p>
            </div>

            <div className="admin-features">
              <div className="admin-feature">
                <div className="admin-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div className="admin-feature-content">
                  <h3>User Management</h3>
                  <p>Manage users, NGOs, and donators</p>
                </div>
              </div>
              <div className="admin-feature">
                <div className="admin-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                </div>
                <div className="admin-feature-content">
                  <h3>Analytics & Reports</h3>
                  <p>Access comprehensive system analytics</p>
                </div>
              </div>
              <div className="admin-feature">
                <div className="admin-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"/>
                  </svg>
                </div>
                <div className="admin-feature-content">
                  <h3>System Settings</h3>
                  <p>Configure platform settings and policies</p>
                </div>
              </div>
              <div className="admin-feature">
                <div className="admin-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div className="admin-feature-content">
                  <h3>Security Oversight</h3>
                  <p>Monitor security and compliance</p>
                </div>
              </div>
            </div>

            <div className="admin-security-note">
              <div className="admin-security-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div className="admin-security-content">
                <h4>Security First</h4>
                <p>Admin accounts have elevated access. Ensure strong passwords and secure handling of credentials.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default AdminRegistration;
