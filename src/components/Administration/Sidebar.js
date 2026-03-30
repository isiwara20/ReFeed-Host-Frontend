//Sewni

import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activePage, setActivePage, adminData, onLogout }) => {
  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard Overview',
      icon: '📊',
      description: 'System overview and statistics'
    },
    {
      id: 'verification',
      name: 'User & Organization Verification',
      icon: '✅',
      description: 'Verify NGOs, donors, and volunteers'
    },
    {
      id: 'donations',
      name: 'Donation Oversight',
      icon: '🍽️',
      description: 'Monitor and manage donations'
    },
    {
      id: 'complaints',
      name: 'Incident & Complaint Management',
      icon: '⚠️',
      description: 'Handle complaints and abuse reports'
    },
    {
      id: 'analytics',
      name: 'Analytics & Impact Reports',
      icon: '📈',
      description: 'View comprehensive analytics and reports'
    },
    {
      id: 'audit-logs',
      name: 'System Audit Logs',
      icon: '📋',
      description: 'View admin activity history'
    }
  ];

  const handleMenuClick = (pageId) => {
    setActivePage(pageId);
  };

  return (
    <div className="admin-sidebar">
      <div className="admin-profile">
        <div className="admin-profile-avatar" onClick={() => setActivePage('profile')} style={{ cursor: 'pointer' }}>
          {adminData?.profilePicture ? (
            <img 
              src={adminData.profilePicture} 
              alt={adminData.name}
              className="admin-profile-img"
            />
          ) : (
            <div className="admin-avatar-placeholder">
              {adminData?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          )}
        </div>
        <div className="admin-profile-info">
          <div className="admin-profile-name">{adminData?.name || 'Admin User'}</div>
          <div className="admin-profile-username" style={{color: '#1f2937', fontWeight: '700', fontSize: '14px'}}>@{adminData?.username || 'admin'}</div>
        </div>
      </div>

      <nav className="admin-sidebar-nav">
        <ul className="admin-nav-menu">
          {menuItems.map((item) => (
            <li 
              key={item.id}
              className="admin-nav-item"
            >
              <button
                className={`admin-nav-link ${activePage === item.id ? 'active' : ''}`}
                onClick={() => handleMenuClick(item.id)}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <div className="admin-nav-content">
                  <div className="admin-nav-text">
                    <span className="admin-nav-name">{item.name}</span>
                    {item.description && (
                      <span className="admin-nav-description">{item.description}</span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="admin-sidebar-footer">
        <button className="admin-logout-btn" onClick={onLogout}>
          <span className="admin-logout-icon">🚪</span>
          <span className="admin-logout-text">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
