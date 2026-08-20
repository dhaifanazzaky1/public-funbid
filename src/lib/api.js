import axios from "axios";
import baseUrl from "../constant/baseUrl.js";

const api = axios.create({ baseURL: baseUrl });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;