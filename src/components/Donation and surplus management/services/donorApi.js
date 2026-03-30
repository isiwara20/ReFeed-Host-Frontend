import API from "../../../api/axios";

export const donorApi = {
  createProfile: (data, user) =>
    API.post("/profile", data, {
      headers: {
        "x-username": user.username,
        "x-role": user.role,
      },
    }),

  getProfile: (username, user) =>
    API.get(`/profile/${username}`, {
      headers: {
        "x-username": user.username,
        "x-role": user.role,
      },
    }),

  updateProfile: (data, user) =>
    API.patch("/profile", data, {
      headers: {
        "x-username": user.username,
        "x-role": user.role,
      },
    }),

  deleteProfile: (username, user) =>
    API.delete(`/profile/${username}`, {
      headers: {
        "x-username": user.username,
        "x-role": user.role,
      },
    }),
};