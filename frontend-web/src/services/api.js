import axios from "axios";

const runtimeProtocol = typeof window !== "undefined" ? window.location.protocol : "http:";
const runtimeHost = typeof window !== "undefined" ? window.location.hostname : "localhost";
const fallbackApiBase = `${runtimeProtocol}//${runtimeHost}:8000`;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || fallbackApiBase;

const client = axios.create({
  baseURL: API_BASE_URL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }
    return Promise.reject(error);
  }
);

export const loginUser = async (payload) => {
  const { data } = await client.post("/login", payload);
  return data;
};

export const fetchReports = async () => {
  const { data } = await client.get("/reports");
  return data;
};

export const fetchWaterData = async () => {
  const { data } = await client.get("/waterdata");
  return data;
};

export const fetchRiskMap = async () => {
  const { data } = await client.get("/risk-map");
  return data;
};

export const fetchAlerts = async () => {
  const { data } = await client.get("/alerts");
  return data;
};

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const exportReportsCsv = async () => {
  const response = await client.get("/reports/export/csv", {
    responseType: "blob",
  });
  downloadBlob(response.data, "symptom_reports.csv");
};

export const exportAlertsCsv = async () => {
  const response = await client.get("/alerts/export/csv", {
    responseType: "blob",
  });
  downloadBlob(response.data, "alerts.csv");
};

export const markAlertRead = async (alertId) => {
  const { data } = await client.post(`/alerts/${alertId}/read`);
  return data;
};

export const predictRisk = async (payload) => {
  const { data } = await client.post("/predict-risk", payload);
  return data;
};

export const getWebSocketUrl = () => {
  if (API_BASE_URL.startsWith("https://")) {
    return API_BASE_URL.replace("https://", "wss://") + "/ws/monitor";
  }
  return API_BASE_URL.replace("http://", "ws://") + "/ws/monitor";
};
