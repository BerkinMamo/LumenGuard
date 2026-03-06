import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.lunalux.com.tr:7194";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const cookies = document.cookie.split('; ');
    const lumenToken = cookies
      .find(row => row.trim().startsWith('lumen_token='))
      ?.split('=')[1];

    if (lumenToken) {
      config.headers.Authorization = `Bearer ${decodeURIComponent(lumenToken)}`;
    }
  }
  return config;
});

if (typeof window === "undefined") {
  const https = require("https");
  api.defaults.httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Lumen Guard: Unauthorized");
    }
    return Promise.reject(error);
  }
);

export const vaultApi = {
  getKycApplicants: () => api.get("/api/vault/customers"),
  getKycDetail: (id: string) => api.get(`/api/vault/kyc/${id}`),
  registerUser: (userData: any) => api.post("/api/vault/register", userData),
  updateKycStatus: (id: string, status: string) =>
    api.put(`/api/vault/kyc/${id}/status`, { status }),
  getDocumentBlob: (docId: string) =>
    api.get(`/api/vault/document/${docId}`, { responseType: 'blob' }),
};

export const auditApi = {
  getLogs: () => api.get("/api/vault/audit-logs"),
  getLogDetail: (id: string) => api.get(`/api/vault/audit-logs/${id}/raw`),
};

export const identityApi = {
  getUsers: () => api.get("/api/identity/users"),
  updateUser: (id: string, data: any) => api.put(`/api/identity/users/${id}`, data),
  getPolicies: () => api.get("/api/identity/policies"),
  savePolicy: (policyData: any) => api.post("/api/identity/policies", policyData),
};

export const systemApi = {
  getHealthStatus: () => api.get("/api/system/health-check"),
  triggerLockdown: (adminPin: string) =>
    api.post("/api/system/lockdown", { pin: adminPin }),
};

export const authApi = {
  login: (data: URLSearchParams) => api.post("/connect/token", data, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  }),
  logout: async () => {
    try {
      await api.post("/api/auth/logout");
      console.log("Core: Session revoked.");
    } catch (err) {
      console.error("Core logout failed, proceeding with local cleanup.", err);
    } finally {
      document.cookie = "lumen_token=; path=/; domain=.lunalux.com.tr; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "lumen_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login";
    }
  }
};

export default api;