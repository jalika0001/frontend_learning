import axios from "axios";

const defaultBaseUrl = "https://backend-learning-oho6.onrender.com";

const rawBaseUrl = import.meta.env.VITE_API_URL || defaultBaseUrl;
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE_URL
});

export default api;