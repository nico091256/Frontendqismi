import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://ticket.di.uz/api' : 'http://localhost:5000/api');
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
export const registerUser      = (data) => api.post('/auth/register', data);
export const loginUser         = (data) => api.post('/auth/login', data);
export const logoutUser        = ()     => api.post('/auth/logout');
export const getMe             = ()     => api.get('/auth/me');
export const updateProfile     = (data) => api.patch('/auth/profile', data);
export const changePassword    = (data) => api.patch('/auth/change-password', data);

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
export const resolveProblem = (id, note) => api.patch(`/problems/${id}/resolve`, { resolveNote: note });
export const deleteProblem  = (id)       => api.delete(`/problems/${id}`);
export const updateProblem  = (id, data) => api.patch(`/problems/${id}`, data);
export const exportExcel    = ()         => api.get('/problems/export', { responseType: 'blob' });
export const getStats       = (year)     => api.get(`/stats${year ? `?year=${year}` : ''}`);
export const assignProblem  = (id, userId) => api.patch(`/problems/${id}/assign`, { userId });
export const getNewCount    = (since)    => api.get(`/problems/new-count${since ? `?since=${since}` : ''}`);
export const checkTicket    = (ticket)   => api.get(`/problems/check/${ticket}`);

// ── Inventarizatsiya (Xodimlar & Texnika) ─────────────────────────
export const getInventory          = (params)     => api.get('/inventory', { params });
export const getInventoryStats     = ()           => api.get('/inventory/stats');
export const createInventoryItem   = (data)       => api.post('/inventory', data);
export const updateInventoryItem   = (id, data)   => api.patch(`/inventory/${id}`, data);
export const deleteInventoryItem   = (id)         => api.delete(`/inventory/${id}`);
export const exportInventoryExcel  = ()           => api.get('/inventory/export', { responseType: 'blob' });

// ── IT Jamoa Chati (Ichki Xodimlar Chati) ─────────────────────────
export const getChatMessages       = ()           => api.get('/chat');
export const sendChatMessage       = (message, image) => api.post('/chat', { message, image });


