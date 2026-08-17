import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const baseURL = rawBaseURL.endsWith('/api') ? rawBaseURL : `${rawBaseURL.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Token ni avtomatik inject qilish ──────────────────────────────────
api.interceptors.request.use((config) => {
  const auth = localStorage.getItem('it_auth');
  if (auth) {
    try {
      const { token } = JSON.parse(auth);
      if (token) config.headers['Authorization'] = `Bearer ${token}`;
    } catch { /* ignore */ }
  }
  return config;
});

// ── Auth ─────────────────────────────────────────────────────────────
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser    = (data) => api.post('/auth/login', data);
export const logoutUser   = ()     => api.post('/auth/logout');
export const getMe        = ()     => api.get('/auth/me');

// ── Foydalanuvchilar (Manager uchun) ─────────────────────────────────
export const getITWorkers   = ()   => api.get('/users?role=IT_SUPPORT');
export const deleteITWorker = (id) => api.delete(`/users/${id}`);

// ── Topshiriqlar ─────────────────────────────────────────────────────
export const getTasks         = ()             => api.get('/tasks');
export const createTask       = (data)         => api.post('/tasks', data);
export const updateTaskStatus = (id, status)   => api.patch(`/tasks/${id}/status`, { status });
export const deleteTask       = (id)           => api.delete(`/tasks/${id}`);

// ── Murojaatlar ───────────────────────────────────────────────────────
export const createProblem  = (data)     => api.post('/problems', data);
export const getAllProblems  = ()         => api.get('/problems');
export const getProblemById = (id)       => api.get(`/problems/${id}`);
export const resolveProblem = (id)       => api.patch(`/problems/${id}/resolve`);
export const deleteProblem  = (id)       => api.delete(`/problems/${id}`);
export const updateProblem  = (id, data) => api.patch(`/problems/${id}`, data);
export const exportExcel    = ()         => api.get('/problems/export', { responseType: 'blob' });
export const getStats       = (year)     => api.get(`/stats${year ? `?year=${year}` : ''}`);
