import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { surplusApi } from "./surplusApi";
import { useAuth } from "../../context/AuthContext";

export default function SurplusCompletePage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!currentUser) { setStatus("error"); setMessage("Please log in first."); return; }
    surplusApi.completeAsAny(id, currentUser)
      .then(() => { setStatus("success"); setMessage("Donation marked as completed!"); })
      .catch((err) => { setStatus("error"); setMessage(err?.response?.data?.message || "Failed to complete donation."); });
  }, [id, currentUser]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", background: "#f4f5f7" }}>
      <div style={{ background: "#fff", border: "1px solid #e2e5ea", padding: "40px 48px", textAlign: "center", maxWidth: 400 }}>
        {status === "loading" && <p style={{ color: "#6b7280" }}>Processing...</p>}
        {status === "success" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
            <h2 style={{ color: "#15803d", margin: "0 0 8px" }}>Completed</h2>
            <p style={{ color: "#6b7280", margin: "0 0 24px" }}>{message}</p>
            <Link to="/surplus" style={{ color: "#00c853", fontWeight: 600, textDecoration: "none" }}>View My Donations</Link>
          </>
        )}
        {status === "error" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✕</div>
            <h2 style={{ color: "#dc2626", margin: "0 0 8px" }}>Error</h2>
            <p style={{ color: "#6b7280", margin: "0 0 24px" }}>{message}</p>
            <Link to="/surplus" style={{ color: "#00c853", fontWeight: 600, textDecoration: "none" }}>Go to Donations</Link>
          </>
        )}
      </div>
    </div>
  );
}
