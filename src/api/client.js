const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://refeed-hosting-backend-production.up.railway.app/api";

/**
 * Lightweight API client built on top of fetch.
 * Usage:
 *   apiClient.get("/notifications/user/123", { token });
 *   apiClient.post("/auth/login", { email, password });
 */
async function request(path, options = {}) {
  const {
    method = "GET",
    body,
    token,
    authUser,
    headers: customHeaders = {},
    ...rest
  } = options;

  const headers = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (authUser?.username && authUser?.role) {
    headers["x-username"] = authUser.username;
    headers["x-role"] = authUser.role;
  }

  const config = {
    method,
    headers,
    ...rest,
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, config);

  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    // Response had no JSON body; that's okay for some endpoints.
  }

  if (!response.ok) {
    const error = new Error(data?.message || data?.error || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const apiClient = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) =>
    request(path, { ...options, method: "POST", body }),
  put: (path, body, options) =>
    request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) =>
    request(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};

