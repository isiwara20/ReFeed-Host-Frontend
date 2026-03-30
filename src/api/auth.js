import { apiClient } from "./client";

/**
 * Login with username and password.
 * Backend returns: { message, _id, username, role, dashboard }
 */
export async function login(credentials) {
  const { username, password } = credentials;
  return apiClient.post("/auth/login", { username, password });
}

/**
 * Register as Donator or NGO.
 * Body: { name, email, password, confirmPassword, phone, role } with role in ["donator", "ngo"]
 */
export async function register(data) {
  return apiClient.post("/auth/register", data);
}
