import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../api/client";
import "./NotificationPreferences.css";
import DonorNavbar from "../DonorNavbar";

const EVENT_GROUPS = [
  {
    title: "Authentication & account",
    description: "Registration and account security events.",
    options: [
      { key: "userRegistration", label: "User registration", description: "Welcome and onboarding notifications." },
      { key: "adminRegistered", label: "Admin registered", description: "Admin account registration updates." },
      { key: "passwordResetSuccess", label: "Password reset success", description: "Security confirmation after password change." },
    ],
  },
  {
    title: "Donations & requests",
    description: "Donation lifecycle and request matching updates.",
    options: [
      { key: "donationCreated", label: "Donation created", description: "When a donation is listed." },
      { key: "requestAccepted", label: "Request accepted", description: "When a request is accepted/matched." },
      { key: "donationCompleted", label: "Donation completed", description: "When donation handover is complete." },
      { key: "foodRequestCreated", label: "Food request created", description: "When a new food request is submitted." },
      { key: "foodRequestUpdated", label: "Food request updated", description: "When request details change." },
      { key: "foodRequestDeleted", label: "Food request deleted", description: "When a request is removed." },
    ],
  },
  {
    title: "Verification",
    description: "Verification workflow updates.",
    options: [
      { key: "verificationSubmitted", label: "Verification submitted", description: "Submission acknowledgement." },
      { key: "verificationApproved", label: "Verification approved", description: "Approval confirmation." },
      { key: "verificationRejected", label: "Verification rejected", description: "Action required notifications." },
    ],
  },
  {
    title: "Orders, complaints & messages",
    description: "Operational events and communication alerts.",
    options: [
      { key: "donationOrderCreated", label: "Donation order created", description: "When an order is initiated." },
      { key: "donationOrderStatusChanged", label: "Donation order status changed", description: "Status transitions for orders." },
      { key: "donationOrderCancelled", label: "Donation order cancelled", description: "Order cancellation updates." },
      { key: "complaintCreated", label: "Complaint created", description: "Complaint submission acknowledgement." },
      { key: "complaintStatusUpdated", label: "Complaint status updated", description: "Updates from complaint handling." },
      { key: "newMessage", label: "New message", description: "New conversation/message alerts." },
    ],
  },
  {
    title: "Surplus, profile & address",
    description: "Surplus lifecycle and profile/address maintenance events.",
    options: [
      { key: "surplusDraftCreated", label: "Surplus draft created", description: "Draft surplus saved." },
      { key: "surplusPublished", label: "Surplus published", description: "Surplus made available." },
      { key: "surplusReserved", label: "Surplus reserved", description: "Reservation updates." },
      { key: "surplusCompleted", label: "Surplus completed", description: "Surplus flow completed." },
      { key: "surplusCollected", label: "Surplus collected", description: "Collection completion updates." },
      { key: "donorProfileCreated", label: "Donor profile created", description: "Profile creation acknowledgement." },
      { key: "donorProfileUpdated", label: "Donor profile updated", description: "Profile update alerts." },
      { key: "donorProfileSoftDeleted", label: "Donor profile deactivated", description: "Soft-delete status updates." },
      { key: "donorProfileHardDeleted", label: "Donor profile permanently deleted", description: "Permanent removal confirmation." },
      { key: "addressCreated", label: "Address added", description: "Address creation updates." },
      { key: "addressUpdated", label: "Address updated", description: "Address change updates." },
      { key: "addressDeleted", label: "Address removed", description: "Address deletion updates." },
    ],
  },
];

const ALL_EVENT_OPTIONS = EVENT_GROUPS.flatMap((group) => group.options);
const ALL_EVENT_KEYS = ALL_EVENT_OPTIONS.map((option) => option.key);

const ROLE_EVENT_KEYS = {
  admin: [
    "adminRegistered",
    "passwordResetSuccess",
    "verificationApproved",
    "verificationRejected",
    "donationOrderCancelled",
    "complaintCreated",
    "complaintStatusUpdated",
    "newMessage",
  ],
  ngo: [
    "userRegistration",
    "passwordResetSuccess",
    "foodRequestCreated",
    "foodRequestUpdated",
    "foodRequestDeleted",
    "verificationSubmitted",
    "verificationApproved",
    "verificationRejected",
    "donationOrderCreated",
    "donationOrderStatusChanged",
    "donationOrderCancelled",
    "complaintCreated",
    "complaintStatusUpdated",
    "newMessage",
    "surplusReserved",
    "surplusCompleted",
    "surplusCollected",
    "addressCreated",
    "addressUpdated",
    "addressDeleted",
  ],
  donor: [
    "userRegistration",
    "passwordResetSuccess",
    "donationCreated",
    "requestAccepted",
    "donationCompleted",
    "verificationSubmitted",
    "verificationApproved",
    "verificationRejected",
    "donationOrderCreated",
    "donationOrderStatusChanged",
    "donationOrderCancelled",
    "complaintCreated",
    "complaintStatusUpdated",
    "newMessage",
    "surplusDraftCreated",
    "surplusPublished",
    "surplusReserved",
    "surplusCompleted",
    "surplusCollected",
    "donorProfileCreated",
    "donorProfileUpdated",
    "donorProfileSoftDeleted",
    "donorProfileHardDeleted",
    "addressCreated",
    "addressUpdated",
    "addressDeleted",
  ],
};

const normalizeRole = (role) => {
  const normalized = String(role || "").trim().toLowerCase();
  if (normalized === "donator") return "donor";
  return normalized;
};

const getVisibleEventKeysByRole = (role) => {
  const normalizedRole = normalizeRole(role);
  return ROLE_EVENT_KEYS[normalizedRole] || ALL_EVENT_KEYS;
};

const buildVisibleEventGroups = (visibleEventKeys) =>
  EVENT_GROUPS.map((group) => ({
    ...group,
    options: group.options.filter((option) => visibleEventKeys.includes(option.key)),
  })).filter((group) => group.options.length > 0);

const DEFAULT_PREFERENCES = {
  channels: {
    email: true,
    inApp: true,
  },
  events: Object.fromEntries(ALL_EVENT_OPTIONS.map((option) => [option.key, true])),
};

const CHANNEL_OPTIONS = [
  {
    key: "email",
    label: "Email notifications",
    description: "Receive updates directly in your inbox.",
  },
  {
    key: "inApp",
    label: "In-app notifications",
    description: "Show alerts in your dashboard and bell popup.",
  },
];

const ROLE_LABELS = {
  donor: "Donator",
  ngo: "NGO",
  admin: "Admin",
};

const getUserId = (currentUser) =>
  currentUser?._id || currentUser?.id || currentUser?.userId || "";



const ToggleRow = ({
  checked,
  onChange,
  label,
  description,
  disabled,
}) => (
  <label className={`rf-pref-toggle-row${disabled ? " is-disabled" : ""}`}>
    <div className="rf-pref-toggle-text">
      <span className="rf-pref-toggle-label">{label}</span>
      {description && <span className="rf-pref-toggle-desc">{description}</span>}
    </div>
    <span className="rf-pref-toggle-wrap">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="rf-pref-toggle-slider" />
    </span>
  </label>
);

const NotificationPreferences = () => {
  const { currentUser } = useAuth();
  const userId = getUserId(currentUser);
  const role = normalizeRole(currentUser?.role);
  const visibleEventKeys = getVisibleEventKeysByRole(role);
  const visibleEventGroups = buildVisibleEventGroups(visibleEventKeys);
  const roleLabel = ROLE_LABELS[role] || "User";
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);

  useEffect(() => {
    if (!userId) {
      return undefined;
    }

    let isCurrent = true;
    const controller = new AbortController();

    const loadPreferences = async () => {
      setLoading(true);
      setHasLoadedInitially(false);
      setError(null);
      try {
        const data = await apiClient.get(
          `/notifications/preferences/${userId}`,
          { token: currentUser.token, signal: controller.signal }
        );

        if (!isCurrent) return;

        if (data) {
          const mergedEvents = Object.fromEntries(
            ALL_EVENT_OPTIONS.map((option) => [
              option.key,
              data.events?.[option.key] ?? DEFAULT_PREFERENCES.events[option.key],
            ])
          );

          const next = {
            channels: {
              email:
                data.channels?.email ??
                DEFAULT_PREFERENCES.channels.email,
              inApp:
                data.channels?.inApp ??
                DEFAULT_PREFERENCES.channels.inApp,
            },
            events: mergedEvents,
          };
          setPreferences(next);
        } else {
          setPreferences(DEFAULT_PREFERENCES);
        }
      } catch (err) {
        if (!isCurrent) return;

        if (err.name === "AbortError") {
          return;
        }

        // If preferences do not exist yet (e.g., 404), fall back to defaults.
        if (err.status === 404) {
          setPreferences(DEFAULT_PREFERENCES);
        } else {
          setError(err);
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
          setHasLoadedInitially(true);
        }
      }
    };

    loadPreferences();
    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [userId, currentUser?.token]);

  useEffect(() => {
    if (!successMessage) return undefined;

    const timeoutId = setTimeout(() => {
      setSuccessMessage("");
    }, 4000);

    return () => clearTimeout(timeoutId);
  }, [successMessage]);

  const handleChannelChange = (channel) => {
    setPreferences((prev) => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: !prev.channels[channel],
      },
    }));
  };

  const handleEventChange = (eventKey) => {
    setPreferences((prev) => ({
      ...prev,
      events: {
        ...prev.events,
        [eventKey]: !prev.events[eventKey],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    setError(null);
    setSuccessMessage("");

    try {
      await apiClient.post(
        "/notifications/preferences",
        {
          userId,
          ...preferences,
        },
        { token: currentUser.token }
      );
      setSuccessMessage("Notification preferences saved successfully.");
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <p className="rf-pref-login-note">
        You need to be logged in to manage notification preferences.
      </p>
    );
  }

  const isInitialLoading = loading && !hasLoadedInitially;

  return (
    <>
    {currentUser?.role === "DONATOR" && <DonorNavbar />}
    <div className="rf-pref-page">
      <header className="rf-pref-header">
        <h1>Notification Settings</h1>
        <p>
        Choose how you want to be notified about donation and request
        activity for your {roleLabel.toLowerCase()} account.
        </p>
      </header>

      {loading && (
        <p className="rf-pref-banner rf-pref-banner-muted">
          Loading your preferences...
        </p>
      )}
      {error && (
        <p className="rf-pref-banner rf-pref-banner-error">
          {error.message ||
            "Failed to load or save notification preferences."}
        </p>
      )}
      {successMessage && (
        <p className="rf-pref-banner rf-pref-banner-success">{successMessage}</p>
      )}

      <form onSubmit={handleSubmit} className="rf-pref-form">
        <section className="rf-pref-card">
          <h2>Channels</h2>
          <p>
            Turn entire channels on or off. These settings apply to all
            notification events.
          </p>
          <div className="rf-pref-list">
            {CHANNEL_OPTIONS.map((option) => (
              <ToggleRow
                key={option.key}
                checked={preferences.channels[option.key]}
                onChange={() => handleChannelChange(option.key)}
                disabled={isInitialLoading}
                label={option.label}
                description={option.description}
              />
            ))}
          </div>
        </section>

        {visibleEventGroups.map((group) => (
          <section className="rf-pref-card" key={group.title}>
            <h2>{group.title}</h2>
            <p>{group.description}</p>
            <div className="rf-pref-list">
              {group.options.map((option) => (
                <ToggleRow
                  key={option.key}
                  checked={preferences.events[option.key]}
                  onChange={() => handleEventChange(option.key)}
                  disabled={isInitialLoading}
                  label={option.label}
                  description={option.description}
                />
              ))}
            </div>
          </section>
        ))}

        {visibleEventGroups.length === 0 && (
          <section className="rf-pref-card">
            <h2>Event preferences</h2>
            <p>
              Event-level toggles are not configured for the {roleLabel.toLowerCase()} account type yet.
            </p>
          </section>
        )}

        <div className="rf-pref-actions">
          <button
            type="submit"
            disabled={saving || isInitialLoading}
            className="rf-pref-save-btn"
          >
            {saving ? "Saving..." : "Save preferences"}
          </button>
        </div>
      </form>
    </div>
    </>
  );
};

export default NotificationPreferences;

