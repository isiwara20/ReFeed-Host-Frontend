//Sewni

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../api/client";
import Sidebar from './Sidebar';
import DashboardOverview from './DashboardOverview';
import UserVerification from './UserVerification';
import DonationOversight from './DonationOversight';
import ComplaintManagement from './ComplaintManagement';
import AnalyticsImpactReports from './AnalyticsImpactReports';
import SystemAuditLogs from './SystemAuditLogs';
import AdminRegistration from './AdminRegistration';
import AdminProfile from './AdminProfile';
import './AdminDashboard.css';
import NotificationBell from "../notifications/NotificationBell";
import NotificationPage from "../notifications/NotificationPage";
import NotificationPreferences from "../notifications/NotificationPreferences";
import MessagesPage from '../communications/MessagesPage';

const AdminDashboard = () => {
  const { currentUser, user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activePage, setActivePage] = useState('dashboard');
  const [adminData, setAdminData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [navigationHistory, setNavigationHistory] = useState(['dashboard']);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchAdminData = useCallback(async () => {
    try {
      const userData = currentUser || user;
      if (userData && userData.username) {
        // Fetch admin profile data with admin headers
        const response = await apiClient.get("/admin/dashboard/summary", {
          headers: {
            'username': userData.username
          }
        });
        
        if (response) {
          // Also fetch profile data to get profile picture
          let profileData = null;
          try {
            profileData = await apiClient.get(`/admin/profile/${userData.username}`);
          } catch (error) {
            console.error('Error fetching profile data:', error);
          }
          
          // Combine with admin profile data
          setAdminData({
            username: userData.username,
            name: userData.name || response.adminName || 'Admin',
            profilePicture: profileData?.profile?.profilepic || null,
            ...response
          });
        }
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setDataLoading(false);
    }
  }, [currentUser, user]);

  useEffect(() => {
    // If still loading auth context, don't do anything
    if (loading) return;
    
    const userData = currentUser || user;
    
    // Check if user exists
    if (!userData) {
      navigate('/login');
      return;
    }
    
    // Check if user is admin (username starts with 'admin')
    const isAdmin = userData?.username && userData.username.startsWith('admin');
    
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    // Read URL parameters to set active page
    const urlParams = new URLSearchParams(location.search);
    const pageParam = urlParams.get('page');
    if (pageParam) {
      setActivePage(pageParam);
    }
    
    fetchAdminData();
  }, [currentUser, user, loading, navigate, fetchAdminData, location.search]);

  // Refetch data when page changes to get updates
  useEffect(() => {
    if (!loading && (currentUser || user)) {
      fetchAdminData();
    }
  }, [activePage, loading, currentUser, user, fetchAdminData]);

  const handleProfileUpdate = (updatedData) => {
    setAdminData(prev => ({
      ...prev,
      ...updatedData,
      profilePicture: updatedData.profile?.profilepic || prev.profilePicture
    }));
  };

  const handleLogout = () => {
    // Clear auth context and redirect to login
    logout();
    navigate('/login');
  };

  const handlePageChange = (pageId) => {
    // Add current page to history before changing
    setNavigationHistory(prev => [...prev, activePage]);
    setActivePage(pageId);
    // Update URL to maintain page state on refresh
    const url = new URL(window.location);
    if (pageId === 'dashboard') {
      url.searchParams.delete('page');
    } else {
      url.searchParams.set('page', pageId);
    }
    window.history.pushState({}, '', url);
  };

  const handleBackNavigation = () => {
    if (navigationHistory.length > 1) {
      // Go back to previous page in history
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Remove current page
      const previousPage = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setActivePage(previousPage);
      
      // Update URL
      const url = new URL(window.location);
      if (previousPage === 'dashboard') {
        url.searchParams.delete('page');
      } else {
        url.searchParams.set('page', previousPage);
      }
      window.history.pushState({}, '', url);
    } else {
      // If no history, go to actual previous page
      window.history.back();
    }
  };

  useEffect(() => {
    // Prevent rubber band scrolling
    const preventOverscroll = (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      
      // Prevent scrolling up when at top
      if (scrollTop === 0 && e.deltaY < 0) {
        e.preventDefault();
      }
      
      // Prevent scrolling down when at bottom
      if (scrollTop + clientHeight >= scrollHeight && e.deltaY > 0) {
        e.preventDefault();
      }
    };

    const mainContent = document.querySelector('.admin-dashboard-main');
    const sidebarNav = document.querySelector('.admin-sidebar-nav');
    
    if (mainContent) {
      mainContent.addEventListener('wheel', preventOverscroll, { passive: false });
      mainContent.addEventListener('touchmove', preventOverscroll, { passive: false });
    }
    
    if (sidebarNav) {
      sidebarNav.addEventListener('wheel', preventOverscroll, { passive: false });
      sidebarNav.addEventListener('touchmove', preventOverscroll, { passive: false });
    }

    return () => {
      if (mainContent) {
        mainContent.removeEventListener('wheel', preventOverscroll);
        mainContent.removeEventListener('touchmove', preventOverscroll);
      }
      if (sidebarNav) {
        sidebarNav.removeEventListener('wheel', preventOverscroll);
        sidebarNav.removeEventListener('touchmove', preventOverscroll);
      }
    };
  }, []);

  // Listen for browser back button
  useEffect(() => {
    const handlePopState = (event) => {
      event.preventDefault();
      handleBackNavigation();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigationHistory, activePage]);

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardOverview adminData={adminData} setActivePage={handlePageChange} />;
      case 'verification':
        return <UserVerification adminData={adminData} />;
      case 'donations':
        return <DonationOversight adminData={adminData} />;
      case 'complaints':
        return <ComplaintManagement adminData={adminData} onLogout={handleLogout} />;
      case 'analytics':
        return <AnalyticsImpactReports adminData={adminData} setActivePage={handlePageChange} />;
      case 'audit-logs':
        return <SystemAuditLogs adminData={adminData} />;
      case 'register':
        return <AdminRegistration adminData={adminData} setActivePage={handlePageChange} />;
      case 'profile':
        return <AdminProfile adminData={adminData} setActivePage={handlePageChange} onProfileUpdate={handleProfileUpdate} />;
      case 'messages':
        return <MessagesPage adminData={adminData} setActivePage={handlePageChange} onProfileUpdate={handleProfileUpdate} />;
      case 'notifications':
        return <NotificationPage />;
      case 'notification-preferences':
        return <NotificationPreferences />;
      default:
        return <DashboardOverview adminData={adminData} setActivePage={handlePageChange} />;
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="admin-loading-spinner"></div>
        <p className="admin-dashboard-loading-text">{loading ? 'Checking authentication...' : 'Loading admin dashboard...'}</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Sidebar 
        activePage={activePage} 
        setActivePage={handlePageChange} 
        adminData={adminData}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
      />
      <div className={`admin-main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <header className="admin-dashboard-header">
          <div className="admin-header-content">
            <button 
              className="admin-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div className="admin-header-title">
              <span className="admin-header-logo-main">Re</span><span className="admin-header-logo-accent">Feed Administration</span>
            </div>
            <div className="admin-header-right">
              <NotificationBell className="navbar__bell" />
              <div className="admin-info">
                <span className="admin-info-text">Welcome, {adminData?.name || 'Admin'}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="admin-dashboard-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
