import axios from "axios";

const API = axios.create({
  baseURL: "https://refeed-hosting-backend-production.up.railway.app/api", // backend
});

export default API;