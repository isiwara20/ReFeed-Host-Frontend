import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

const BrowseDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("AVAILABLE");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    donationsApi
      .listDonations({ status: filter })
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
  }, [filter]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Browse donations</h1>
      <p className="text-gray-600 text-sm mb-6">
        View available surplus food and accept donations to distribute.
      </p>
      <div className="flex flex-wrap gap-2 mb-6">
        {["AVAILABLE", "ACCEPTED", "COMPLETED"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              filter === s
                ? "bg-green-600 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {STATUS_LABELS[s]?.text || s}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">
          {error?.message || "Failed to load donations."}
        </div>
      )}
      {!loading && !error && donations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-600">No donations found for this filter.</p>
          {filter === "AVAILABLE" && (
            <p className="text-sm text-gray-500 mt-1">
              Check back later or ask donators to list surplus food.
            </p>
          )}
        </div>
      )}
      {!loading && !error && donations.length > 0 && (
        <ul className="space-y-4">
          {donations.map((d) => {
            const donator = d.donatorId || {};
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
                        {d.location && ` · ${d.location}`}
                      </p>
                      {d.donatorId && (
                        <p className="text-xs text-gray-500 mt-1">
                          From {donator.name || donator.username}
                        </p>
                      )}
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

export default BrowseDonations;
