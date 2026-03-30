import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import * as donationsApi from "../../api/donations";
import LoadingSpinner from "../ui/LoadingSpinner";

const CATEGORY_LABELS = {
  produce: "Produce",
  dairy: "Dairy",
  bakery: "Bakery",
  prepared: "Prepared",
  packaged: "Packaged",
  other: "Other",
};

const STATUS_LABELS = {
  AVAILABLE: { text: "Available", class: "bg-green-100 text-green-800" },
  ACCEPTED: { text: "Accepted", class: "bg-amber-100 text-amber-800" },
  COMPLETED: { text: "Completed", class: "bg-gray-100 text-gray-700" },
};

const formatDate = (d) => {
  if (!d) return "";
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(undefined, { dateStyle: "short" });
};

const MyDonations = () => {
  const { currentUser } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser?._id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    donationsApi
      .listDonations({ donatorId: currentUser._id }, { token: currentUser.token })
      .then((data) => {
        if (!cancelled) setDonations(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [currentUser?._id, currentUser?.token]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My donations</h1>
      <p className="text-gray-600 text-sm mb-6">
        Donations you’ve listed. Acceptances and completion show here.
      </p>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">
          {error?.message || "Failed to load your donations."}
        </div>
      )}
      {!loading && !error && donations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-600">You haven’t listed any donations yet.</p>
          <Link
            to="/donations/new"
            className="inline-block mt-4 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
          >
            Create your first donation
          </Link>
        </div>
      )}
      {!loading && !error && donations.length > 0 && (
        <ul className="space-y-4">
          {donations.map((d) => {
            const statusInfo = STATUS_LABELS[d.status] || { text: d.status, class: "" };
            return (
              <li key={d._id}>
                <Link
                  to={`/donations/${d._id}`}
                  className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="font-semibold text-gray-900">{d.title}</h2>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {CATEGORY_LABELS[d.category] || d.category} · {d.quantity}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-1 rounded text-xs font-medium ${statusInfo.class}`}
                    >
                      {statusInfo.text}
                    </span>
                  </div>
                  {d.expiresAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Expires {formatDate(d.expiresAt)}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MyDonations;
