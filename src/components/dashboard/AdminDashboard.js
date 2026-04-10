import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";

const AdminDashboard = () => {
  const { currentUser } = useAuth();

  return (
    
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome back, {currentUser?.username || "admin"}. Manage the ReFeed platform here.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/users"
          className="block p-4 rounded-xl border border-gray-200 bg-white hover:border-green-300 hover:shadow-md transition-shadow"
        >
          <span className="font-medium text-gray-900">Users</span>
          <p className="text-sm text-gray-600 mt-1">View and manage donators and NGOs</p>
        </Link>
        <Link
          to="/notifications"
          className="block p-4 rounded-xl border border-gray-200 bg-white hover:border-green-300 hover:shadow-md transition-shadow"
        >
          <span className="font-medium text-gray-900">Notifications</span>
          <p className="text-sm text-gray-600 mt-1">Platform notification overview</p>
        </Link>
        <Link
          to="/settings/notifications"
          className="block p-4 rounded-xl border border-gray-200 bg-white hover:border-green-300 hover:shadow-md transition-shadow"
        >
          <span className="font-medium text-gray-900">Notification settings</span>
          <p className="text-sm text-gray-600 mt-1">Your notification preferences</p>
        </Link>
      </div>
      <div className="mt-8 p-4 rounded-xl bg-amber-50 border border-amber-200">
        <p className="text-sm text-amber-800">
          <strong>Coming soon:</strong> Analytics, template management, and moderation tools.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
