import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NgoDashboard = () => {
  const { currentUser } = useAuth();

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">NGO dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome back, {currentUser?.username || "NGO"}. Here you can browse donations and manage requests.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/donations"
          className="block p-4 rounded-xl border border-gray-200 bg-white hover:border-green-300 hover:shadow-md transition-shadow"
        >
          <span className="font-medium text-gray-900">Browse donations</span>
          <p className="text-sm text-gray-600 mt-1">View available surplus food and accept donations</p>
        </Link>
        <Link
          to="/notifications"
          className="block p-4 rounded-xl border border-gray-200 bg-white hover:border-green-300 hover:shadow-md transition-shadow"
        >
          <span className="font-medium text-gray-900">Notifications</span>
          <p className="text-sm text-gray-600 mt-1">Request updates and donor messages</p>
        </Link>
        <Link
          to="/settings/notifications"
          className="block p-4 rounded-xl border border-gray-200 bg-white hover:border-green-300 hover:shadow-md transition-shadow"
        >
          <span className="font-medium text-gray-900">Notification settings</span>
          <p className="text-sm text-gray-600 mt-1">Choose how you’re notified</p>
        </Link>
      </div>
    </div>
  );
};

export default NgoDashboard;
