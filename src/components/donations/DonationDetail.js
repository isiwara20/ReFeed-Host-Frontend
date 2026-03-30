import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import * as donationsApi from "../../api/donations";
import LoadingSpinner from "../ui/LoadingSpinner";

const CATEGORY_LABELS = {
  produce: "Produce",
  dairy: "Dairy",
  bakery: "Bakery",
  prepared: "Prepared food",
  packaged: "Packaged",
  other: "Other",
};

const DonationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const role = currentUser?.role?.toUpperCase?.() || currentUser?.role;
  const isNgo = role === "NGO";
  const isDonator = role === "DONATOR";

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    donationsApi
      .getDonation(id, { token: currentUser?.token })
      .then((data) => {
        if (!cancelled) setDonation(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id, currentUser?.token]);

  const handleAccept = async () => {
    if (!currentUser?._id || !donation) return;
    setActionError("");
    setActionLoading(true);
    try {
      const updated = await donationsApi.acceptDonation(
        donation._id,
        currentUser._id,
        { token: currentUser.token }
      );
      setDonation(updated);
    } catch (err) {
      setActionError(err?.message || err?.data?.message || "Failed to accept");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!donation) return;
    setActionError("");
    setActionLoading(true);
    try {
      const updated = await donationsApi.completeDonation(donation._id, {
        token: currentUser?.token,
      });
      setDonation(updated);
    } catch (err) {
      setActionError(err?.message || err?.data?.message || "Failed to complete");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (error || !donation) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-xl border border-gray-200">
        <p className="text-red-600">
          {error?.message || "Donation not found."}
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 text-sm text-gray-700 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  const donator = donation.donatorId || {};
  const acceptedBy = donation.acceptedBy || {};

  return (
    <div className="max-w-2xl mx-auto">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm text-gray-600 hover:text-green-700 mb-4"
      >
        ← Back
      </button>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h1 className="text-xl font-bold text-gray-900">{donation.title}</h1>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                donation.status === "AVAILABLE"
                  ? "bg-green-100 text-green-800"
                  : donation.status === "ACCEPTED"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {donation.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {CATEGORY_LABELS[donation.category] || donation.category} · {donation.quantity}
          </p>
        </div>
        <div className="p-6 space-y-4">
          {donation.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">Description</h3>
              <p className="text-sm text-gray-600 mt-1">{donation.description}</p>
            </div>
          )}
          {donation.location && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">Pickup location</h3>
              <p className="text-sm text-gray-600 mt-1">{donation.location}</p>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-gray-700">Donator</h3>
            <p className="text-sm text-gray-600 mt-1">
              {donator.name || donator.username}
              {donator.phone && ` · ${donator.phone}`}
              {donator.email && ` · ${donator.email}`}
            </p>
          </div>
          {donation.status === "ACCEPTED" && acceptedBy && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">Accepted by</h3>
              <p className="text-sm text-gray-600 mt-1">
                {acceptedBy.name || acceptedBy.username}
                {acceptedBy.phone && ` · ${acceptedBy.phone}`}
              </p>
            </div>
          )}
          {donation.expiresAt && (
            <p className="text-xs text-gray-500">
              Expires {formatDate(donation.expiresAt)}
            </p>
          )}
          <p className="text-xs text-gray-400">
            Listed {formatDate(donation.createdAt)}
          </p>
        </div>
        {actionError && (
          <div className="px-6 pb-4">
            <p className="text-sm text-red-600">{actionError}</p>
          </div>
        )}
        <div className="px-6 pb-6 flex flex-wrap gap-3">
          {isNgo && donation.status === "AVAILABLE" && (
            <button
              type="button"
              onClick={handleAccept}
              disabled={actionLoading}
              className="px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-60 flex items-center gap-2"
            >
              {actionLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Accepting…
                </>
              ) : (
                "Accept donation"
              )}
            </button>
          )}
          {isDonator && donation.status === "ACCEPTED" && (
            <button
              type="button"
              onClick={handleComplete}
              disabled={actionLoading}
              className="px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-60 flex items-center gap-2"
            >
              {actionLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Completing…
                </>
              ) : (
                "Mark as completed"
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Back to list
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonationDetail;
