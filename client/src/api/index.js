import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4001";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

const getSid = (s) => s?.siteId || s;

export const fetchEvents = async (siteId, groupBy, type) => {
  const { data } = await api.get("/events", { params: { siteId: getSid(siteId), groupBy, type } });
  return data;
};

export const fetchLive = async (siteId) => {
  const { data } = await api.get("/live", { params: { siteId: getSid(siteId) } });
  return data;
};

export const fetchFunnel = async (siteId) => {
  const { data } = await api.get("/funnel", { params: { siteId: getSid(siteId) } });
  return data;
};

export const fetchHeatmap = async (siteId, page) => {
  const { data } = await api.get("/heatmap", { params: { siteId: getSid(siteId), page } });
  return data;
};

export const fetchSessions = async (siteId) => {
  const { data } = await api.get("/sessions", { params: { siteId: getSid(siteId) } });
  return data;
};

export const fetchSuggestions = async (siteId) => {
  const { data } = await api.get("/suggestions", { params: { siteId: getSid(siteId) } });
  return data;
};

export default api;
