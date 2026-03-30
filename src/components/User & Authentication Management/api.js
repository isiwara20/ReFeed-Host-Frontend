const BASE_URL = "https://refeed-hosting-backend-production.up.railway.app/api";

export const api = {
  register: (data) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  sendOTP: (phone) =>
    fetch(`${BASE_URL}/otp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    }).then((r) => r.json()),

  verifyOTP: (phone, otp) =>
    fetch(`${BASE_URL}/otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
    }).then((r) => r.json()),

  identifyUser: (identifier) =>
    fetch(`${BASE_URL}/password/identify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier }),
    }).then((r) => r.json()),

  resetPassword: (username, newPassword, confirmPassword) =>
    fetch(`${BASE_URL}/password/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, newPassword, confirmPassword }),
    }).then((r) => r.json()),
};
