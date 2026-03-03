import axios from 'axios';

const API_BASE_URL = "https://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const vaultApi = {

  getSecrets: () => api.get('/vault/secrets'),
  
  revealSecret: (id: string) => api.get(`/vault/secrets/${id}/reveal`),
  
  // Yeni veri ekler (Backend'de otomatik zarf şifreleme yapar)
  addSecret: (name: string, value: string) => 
    api.post(`/vault/add-secret?name=${encodeURIComponent(name)}&value=${encodeURIComponent(value)}`)
};