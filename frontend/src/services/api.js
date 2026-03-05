import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
  timeout: 15000,
});

// Attach JWT token to every request if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("ww_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------- Auth ----------

export const login = (email, password) =>
  API.post("/auth/login", { email, password });

export const register = (username, email, password) =>
  API.post("/auth/register", { username, email, password });

export const getMe = () => API.get("/auth/me");

// ---------- Complaints ----------

export const createComplaint = (data) => API.post("/complaints/create", data);

export const getComplaints = () => API.get("/complaints");

export const searchComplaints = (q) => API.get("/complaints", { params: { q } });

export const getRecentComplaints = (limit = 5) =>
  API.get("/complaints", { params: { limit } });

export const updateComplaintStatus = (id, status) =>
  API.put(`/complaints/${id}/status`, { status });

// ---------- Prediction ----------

export const predictRisk = (data) => API.post("/prediction/risk", data);

// ---------- Analytics ----------

export const getAnalyticsSummary = () => API.get("/analytics/summary");

export const getAnalyticsDetail = () => API.get("/analytics/detail");

export const getAnalyticsTrends = () => API.get("/analytics/trends");

export const getWaterDataMonthly = () => API.get("/analytics/water-data");

// ---------- Hygiene ----------

export const getHygieneTips = (category) =>
  API.get("/hygiene/tips", { params: category ? { category } : {} });

// ---------- Water Conservation AI ----------

export const getConservationRecommendations = (data) =>
  API.post("/conservation/recommend", data);

// ---------- Water Quality ----------

export const analyzeWaterQuality = (data) =>
  API.post("/water-quality/analyze", data);

// ---------- Health ----------

export const healthCheck = () => API.get("/health");

export default API;
