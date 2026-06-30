import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Injecte le token JWT automatiquement
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirige vers /login si 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────────
export const register = (data) => API.post('/auth/register', data);
export const login = (email, password) => {
  const form = new FormData();
  form.append('username', email);
  form.append('password', password);
  return API.post('/auth/login', form);
};
export const getMe = () => API.get('/auth/me');

// ─── Projects ────────────────────────────────────────────
export const getProjects = () => API.get('/projects');
export const createProject = (data) => API.post('/projects', data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);
export const updateProject = (id, data) => API.patch(`/projects/${id}`, data);

// ─── Snapshots ───────────────────────────────────────────
export const getLatestSnapshot = (projectId) =>
  API.get(`/projects/${projectId}/snapshots/latest`);
export const saveSnapshot = (projectId, data) =>
  API.post(`/projects/${projectId}/snapshots`, data);
export const getSnapshots = (projectId) =>
  API.get(`/projects/${projectId}/snapshots`);

// ─── Members ─────────────────────────────────────────────
export const inviteMember = (projectId, email, role) =>
  API.post(`/projects/${projectId}/members`, { email, role });
export const removeMember = (projectId, userId) =>
  API.delete(`/projects/${projectId}/members/${userId}`);
export const getMembers = (projectId) =>
  API.get(`/projects/${projectId}/members`);

export default API;
