import Constants from "expo-constants";
import axios from "axios";
import { Platform } from "react-native";

const emulatorFallback = Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://localhost:8000";
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || emulatorFallback;

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const loginUser = async ({ email, password }) => {
  const { data } = await client.post("/login", { email, password });
  return data;
};

export const registerUser = async ({ email, full_name, password }) => {
  const { data } = await client.post("/register", {
    email,
    full_name,
    password,
    role: "community",
  });
  return data;
};

export const postSymptomReport = async (payload, token) => {
  const { data } = await client.post("/report-symptom", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const fetchAlerts = async (token) => {
  const { data } = await client.get("/alerts", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
