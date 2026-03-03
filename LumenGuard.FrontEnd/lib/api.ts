import axios from "axios";

// Gateway adresi - YARP üzerinden yönlendirme yapar
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Auth token'ı tüm isteklere ekler
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("lumen_token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * KYC & Compliance Module (kyc-module.tsx & kyc-detail-modal.tsx bazlı)
 *
 */
export const vaultApi = {
  // Tüm KYC arşivi ve kuyruk listesini getirir
  getKycApplicants: () => api.get("/api/vault/customers"),
  
  // KYC detayı, biyometrik skorlar ve belge eşleşmeleri
  getKycDetail: (id: string) => api.get(`/api/vault/kyc/${id}`),
  
  // Yeni kullanıcı kaydı (Hassas veriler Backend'de HSM ile mühürlenir)
  registerUser: (userData: any) => api.post("/api/vault/register", userData),
  
  // KYC Onay/Red ve HSM Anahtar Atama işlemi
  updateKycStatus: (id: string, status: 'Verified' | 'Rejected' | 'Pending') => 
    api.put(`/api/vault/kyc/${id}/status`, { status }),

  // PDF Preview: Mühürlü dökümanı görüntüler
  getDocumentBlob: (docId: string) => 
    api.get(`/api/vault/document/${docId}`, { responseType: 'blob' }),
};

/**
 * Audit Log Module (audit-log-module.tsx bazlı)
 *
 */
export const auditApi = {
  // Tüm kriptografik işlem kayıtlarını getirir (Vault Access, Key Rotation vb.)
  getLogs: () => api.get("/api/vault/audit-logs"),
  
  // Belirli bir logun ham JSON içeriğini getirir
  getLogDetail: (id: string) => api.get(`/api/vault/audit-logs/${id}/raw`),
};

/**
 * Identity & Policy Module (identity-module.tsx & policy-module.tsx bazlı)
 *
 */
export const identityApi = {
  // Aktif kullanıcı oturumları ve kimlik portalı verileri
  getUsers: () => api.get("/api/identity/users"),
  
  // Kullanıcı düzenleme modalı için güncelleme
  updateUser: (id: string, data: any) => api.put(`/api/identity/users/${id}`, data),
  
  // OAuth 2.0 Client ve Scope politikaları (Duende IdentityServer)
  getPolicies: () => api.get("/api/identity/policies"),
  
  // Yeni politika veya yetki tanımı
  savePolicy: (policyData: any) => api.post("/api/identity/policies", policyData),
};

/**
 * System & Health (system-health-bar.tsx & emergency-lockdown-modal.tsx bazlı)
 *
 */
export const systemApi = {
  // HSM durumu, Token hızı ve Sistem nominal kontrolü
  getHealthStatus: () => api.get("/api/system/health"),
  
  // Acil durum: Tüm HSM slotlarını ve girişleri dondurur
  triggerLockdown: (adminPin: string) => 
    api.post("/api/system/lockdown", { pin: adminPin }),
};

/**
 * Auth Katmanı (Login)
 */
export const authApi = {
  // OpenIddict üzerinden token alımı
  login: (data: URLSearchParams) => api.post("/connect/token", data, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  }),
};

export default api;