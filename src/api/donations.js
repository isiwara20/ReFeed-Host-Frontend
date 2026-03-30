import { apiClient } from "./client";

export const CATEGORIES = [
  "produce",
  "dairy",
  "bakery",
  "prepared",
  "packaged",
  "other",
];

export async function createDonation(data, options = {}) {
  return apiClient.post("/donations", data, options);
}

export async function listDonations(params = {}, options = {}) {
  const search = new URLSearchParams(params).toString();
  const path = search ? `/donations?${search}` : "/donations";
  return apiClient.get(path, options);
}

export async function getDonation(id, options = {}) {
  return apiClient.get(`/donations/${id}`, options);
}

export async function acceptDonation(id, ngoId, options = {}) {
  return apiClient.patch(`/donations/${id}/accept`, { ngoId }, options);
}

export async function completeDonation(id, options = {}) {
  return apiClient.patch(`/donations/${id}/complete`, {}, options);
}
