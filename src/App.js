import React from "react";
import DonationMap from "./components/NGO Matching & Logistics Coordination/donationpickupplace";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/User & Authentication Management/Register";
import NotificationPage from "./components/notifications/NotificationPage";
import NotificationPreferences from "./components/notifications/NotificationPreferences";
import MessagesPage from "./components/communications/MessagesPage";
import UsersList from "./components/UsersList";

import HomePage from "./home/HomePage";
import DonatorDashboard from "./components/dashboard/DonatorDashboard";
import DonorCreatePage from "./components/Donation and surplus management/DonorCreatePage";
import DonorProfilePage from "./components/Donation and surplus management/DonorProfilePage";
import SurplusDonationPage from "./components/surplus/SurplusDonationPage";
import SurplusCompletePage from "./components/surplus/SurplusCompletePage";
import ReportsPage from "./components/reports/ReportsPage";
import NgoDashboard from "./components/NGO Matching & Logistics Coordination/NgoDashboard";
import AdminDashboard from "./components/Administration/AdminDashboard";
import AdminRegistration from "./components/Administration/AdminRegistration";
import RestaurantPage from "./components/restaurant/RestaurantPage";
import DonatorsPage from "./components/donators/DonatorsPage";
import ForgotPassword from "./components/User & Authentication Management/ForgotPassword";


const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
};

function AppLayout() {
  const location = useLocation();
  const donorRoutePrefixes = [
    "/donator-dashboard",
    "/create-donor",
    "/donor-profile",
    "/surplus",
    "/reports",
    "/restaurant"
  ];
  const isNgoDashboard = location.pathname.startsWith("/ngo-dashboard");
  const isAdminDashboard = location.pathname.startsWith("/admin-dashboard");
  const authRoutePrefixes = ["/login", "/register", "/forgot-password"];
  const communicationRoutePrefixes = [];
  const isAuthPage = authRoutePrefixes.some((route) => location.pathname.startsWith(route));
  const isDonorPage = donorRoutePrefixes.some((route) => location.pathname.startsWith(route));
  const isCommunicationPage = communicationRoutePrefixes.some((route) => location.pathname.startsWith(route));
  const isHomePage = location.pathname === "/";
  const hideGlobalNavbar = isNgoDashboard || isAdminDashboard || isAuthPage || isDonorPage || isCommunicationPage;
  const useConstrainedContainer = !(hideGlobalNavbar || isHomePage);

  return (
    <>
      {!hideGlobalNavbar && <Navbar />}

      <div className={useConstrainedContainer ? "container mx-auto mt-4" : ""}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationPage /></ProtectedRoute>} />
          <Route path="/settings/notifications" element={<ProtectedRoute><NotificationPreferences /></ProtectedRoute>} />
          
            <Route path="/users" element={<ProtectedRoute><UsersList /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/donator-dashboard" element={<ProtectedRoute><DonatorDashboard /></ProtectedRoute>} />
          <Route path="/create-donor" element={<ProtectedRoute><DonorCreatePage /></ProtectedRoute>} />
          <Route path="/donor-profile" element={<ProtectedRoute><DonorProfilePage /></ProtectedRoute>} />
          <Route path="/surplus/complete/:id" element={<SurplusCompletePage />} />
          <Route path="/surplus" element={<ProtectedRoute><SurplusDonationPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/ngo-dashboard" element={<ProtectedRoute><NgoDashboard /></ProtectedRoute>} />
          <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/register" element={<ProtectedRoute><AdminRegistration /></ProtectedRoute>} />
          <Route path="/donators" element={<DonatorsPage />} />
          <Route path="/restaurant" element={<ProtectedRoute><RestaurantPage /></ProtectedRoute>} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
