import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
  timeout: 15000,
});

// ---------- Complaints ----------

export const createComplaint = (data) => API.post("/complaints/create", data);

export const getComplaints = () => API.get("/complaints");

export const updateComplaintStatus = (id, status) =>
  API.put(`/complaints/${id}/status`, { status });

// ---------- Prediction ----------

export const predictRisk = (data) => API.post("/prediction/risk", data);

// ---------- Analytics ----------

export const getAnalyticsSummary = () => API.get("/analytics/summary");

export const getAnalyticsDetail = () => API.get("/analytics/detail");

export const getAnalyticsTrends = () => API.get("/analytics/trends");

// ---------- Hygiene ----------

export const getHygieneTips = (category) =>
  API.get("/hygiene/tips", { params: category ? { category } : {} });

// ---------- Health ----------

export const healthCheck = () => API.get("/health");

export default API;
