import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/axios";
import "./restaurant.css";

export default function RestaurantPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", address: "", phone: "", description: "",
    foodsServed: "", openingHours: "", image: "",
  });
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState("");

  const headers = { "x-username": currentUser.username, "x-role": currentUser.role };

  useEffect(() => {
    API.get("/restaurant/mine", { headers })
      .then((res) => setForm({ ...res.data, image: res.data.image || "" }))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []); // eslint-disable-line

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        setForm((prev) => ({ ...prev, image: canvas.toDataURL("image/jpeg", 0.7) }));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.address.trim()) return setError("Name and address are required.");
    try {
      setLoading(true);
      await API.post("/restaurant", form, { headers });
      setSuccess(true);
      setTimeout(() => navigate("/donator-dashboard"), 1500);
    } catch (ex) {
      setError(ex.response?.data?.message || "Failed to save. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="rst-loading"><div className="rst-spinner" /></div>;

  return (
    <div className="rst-page">
      <header className="rst-nav">
        <div className="rst-nav-inner">
          <a href="/" className="rst-logo">Re<span>Feed</span></a>
          <nav className="rst-nav-links">
            <Link to="/donator-dashboard">Dashboard</Link>
          </nav>
          <button className="rst-logout" onClick={() => { logout(); navigate("/"); }}>Sign out</button>
        </div>
      </header>

      <main className="rst-main">
        <div className="rst-breadcrumb">
          <Link to="/donator-dashboard">Dashboard</Link><span>/</span><span>Restaurant Details</span>
        </div>

        <div className="rst-layout">
          {/* Form */}
          <div className="rst-form-card">
            <h1 className="rst-title">Restaurant Details</h1>
            <p className="rst-sub">Add your restaurant info so NGOs know where the food comes from.</p>

            {error   && <div className="rst-alert rst-alert-error">{error}</div>}
            {success && <div className="rst-alert rst-alert-success">Saved! Redirecting…</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="rst-row">
                <div className="rst-field">
                  <label>Restaurant Name *</label>
                  <input placeholder="e.g. Green Bites" value={form.name} onChange={set("name")} />
                </div>
                <div className="rst-field">
                  <label>Phone</label>
                  <input placeholder="+94 77 123 4567" value={form.phone} onChange={set("phone")} />
                </div>
              </div>

              <div className="rst-field">
                <label>Address *</label>
                <input placeholder="123 Main St, Colombo" value={form.address} onChange={set("address")} />
              </div>

              <div className="rst-row">
                <div className="rst-field">
                  <label>Foods Served</label>
                  <input placeholder="Rice, Curry, Roti, Desserts…" value={form.foodsServed} onChange={set("foodsServed")} />
                </div>
                <div className="rst-field">
                  <label>Opening Hours</label>
                  <input placeholder="Mon–Sat 8am–10pm" value={form.openingHours} onChange={set("openingHours")} />
                </div>
              </div>

              <div className="rst-field">
                <label>Description</label>
                <textarea rows={3} placeholder="Tell us about your restaurant…" value={form.description} onChange={set("description")} />
              </div>

              <div className="rst-field">
                <label>Restaurant Photo</label>
                <div className="rst-img-upload">
                  {form.image && <img src={form.image} alt="preview" className="rst-img-preview" />}
                  <label className="rst-img-btn">
                    {form.image ? "Change Photo" : "Upload Photo"}
                    <input type="file" accept="image/*" onChange={handleImage} hidden />
                  </label>
                </div>
              </div>

              <div className="rst-actions">
                <button type="submit" className="rst-btn-primary" disabled={loading || success}>
                  {loading ? <span className="rst-spinner-sm" /> : null}
                  {loading ? "Saving…" : "Save Details"}
                </button>
                <Link to="/donator-dashboard" className="rst-btn-ghost">Cancel</Link>
              </div>
            </form>
          </div>

          {/* Preview */}
          {form.name && (
            <div className="rst-preview-card">
              <p className="rst-preview-label">Preview</p>
              {form.image && <img src={form.image} alt="restaurant" className="rst-preview-img" />}
              <div className="rst-preview-body">
                <h3 className="rst-preview-name">{form.name}</h3>
                {form.address     && <p className="rst-preview-info">{form.address}</p>}
                {form.phone       && <p className="rst-preview-info">{form.phone}</p>}
                {form.openingHours && <p className="rst-preview-info">{form.openingHours}</p>}
                {form.foodsServed  && <p className="rst-preview-info">{form.foodsServed}</p>}
                {form.description  && <p className="rst-preview-desc">{form.description}</p>}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
