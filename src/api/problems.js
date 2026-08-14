import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Auto-inject admin key from localStorage if present
api.interceptors.request.use((config) => {
  const adminKey = localStorage.getItem('it_admin_key');
  if (adminKey) {
    config.headers['x-admin-key'] = adminKey;
  }
  return config;
});

// Verify Admin Password / PIN
export const verifyAdminPassword = (password) => api.post('/auth/verify-admin', { password });

// Submit a new problem (employee - public)
export const createProblem = (data) => api.post('/problems', data);

// Get all problems (admin)
export const getAllProblems = () => api.get('/problems');

// Get single problem
export const getProblemById = (id) => api.get(`/problems/${id}`);

// Mark as resolved (admin)
export const resolveProblem = (id) => api.patch(`/problems/${id}/resolve`);

// Delete problem (admin)
export const deleteProblem = (id) => api.delete(`/problems/${id}`);

// Get analytics/stats (admin reports) — ?year=2026
export const getStats = (year) => api.get(`/stats${year ? `?year=${year}` : ''}`);


