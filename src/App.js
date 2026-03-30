import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/User & Authentication Management/Register";
import ForgotPassword from "./components/User & Authentication Management/ForgotPassword";
import UsersList from "./components/UsersList";
import NotificationPage from "./components/notifications/NotificationPage";
import NotificationPreferences from "./components/notifications/NotificationPreferences";
import MessagesPage from "./components/communications/MessagesPage";
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<><Navbar /><div className="container mx-auto mt-4"><Home /></div></>} />
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
      </Router>
    </AuthProvider>
  );
}

export default App;
