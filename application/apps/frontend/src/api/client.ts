import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// Auth API Calls
export async function loginUser(credentials: any) {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
}

export async function registerUser(userData: any) {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
}

// Food Analysis API Calls
export async function uploadFoodImage(file: File) {
  const formData = new FormData();
  formData.append('image', file);
  const response = await apiClient.post('/food/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function getAnalysisResult(analysisId: string, servingGrams = 100) {
  const response = await apiClient.get(`/food/analysis/${analysisId}?servingGrams=${servingGrams}`);
  return response.data;
}

export async function getAnalysisStatus(analysisId: string) {
  const response = await apiClient.get(`/food/analysis/${analysisId}/status`);
  return response.data;
}

export async function getAnalysisHistory(page = 1, limit = 10) {
  const response = await apiClient.get(`/food/history?page=${page}&limit=${limit}`);
  return response.data;
}
