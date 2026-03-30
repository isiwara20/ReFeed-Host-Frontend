import API from "../../api/axios";

// Role middleware on backend checks for "DONOR" (not "DONATOR")
const headers = (user) => ({
  "x-username": user.username,
  "x-role": "DONOR",
});

export const surplusApi = {
  // POST /api/surplus  — create draft
  createDraft: (data, user) =>
    API.post("/surplus", data, { headers: headers(user) }),

  // GET /api/surplus/mine — list my donations
  listMine: (user) =>
    API.get("/surplus/mine", { headers: headers(user) }),

  // POST /api/surplus/:id/publish — DRAFT → PUBLISHED
  publish: (id, user) =>
    API.post(`/surplus/${id}/publish`, {}, { headers: headers(user) }),

  // POST /api/surplus/:id/reserve — PUBLISHED → RESERVED
  reserve: (id, user) =>
    API.post(`/surplus/${id}/reserve`, {}, { headers: headers(user) }),

  // POST /api/surplus/:id/collect — RESERVED → COLLECTED
  collect: (id, user) =>
    API.post(`/surplus/${id}/collect`, {}, { headers: headers(user) }),

  // POST /api/surplus/:id/complete — COLLECTED → COMPLETED (any role)
  completeAsAny: (id, user) =>
    API.post(`/surplus/${id}/complete`, {}, {
      headers: { "x-username": user.username, "x-role": user.role === "DONATOR" ? "DONOR" : user.role }
    }),

  // POST /api/surplus/:id/complete — COLLECTED → COMPLETED
  complete: (id, user) =>
    API.post(`/surplus/${id}/complete`, {}, { headers: headers(user) }),

  // GET /api/donation-orders-status/ngo-details-ordered/:id — get NGO order for a donation
  getOrderDetails: (id, user) =>
    API.get(`/donation-orders-status/ngo-details-ordered/${id}`, { headers: headers(user) }),

  // GET /api/surplus/:id/qrcode
  getQRCode: (id, user) =>
    API.get(`/surplus/${id}/qrcode`, { headers: headers(user) }),

  // GET /api/surplus/nearby?lat=&lng=
  getNearbyNGOs: (lat, lng, user) =>
    API.get(`/surplus/nearby?lat=${lat}&lng=${lng}`, { headers: headers(user) }),
};
