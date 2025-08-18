export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const API_PREFIX = `${BASE_URL}/api/v1`; 

// Helper to add query params safely
export const withQuery = (path: string, params?: Record<string, string | number>) => {
  if (!params) return path;
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return q ? `${path}?${q}` : path;
};

export const ENDPOINTS = {
  auth: {
    login: `${API_PREFIX}/auth/login`,
    register: `${API_PREFIX}/auth/register`,
    refresh: `${API_PREFIX}/auth/refresh`,
    logout: `${API_PREFIX}/auth/logout`,
    me: `${API_PREFIX}/auth/me`,
  },
  users: {
    list: (params?: { page?: number; search?: string }) =>
      withQuery(`${API_PREFIX}/users`, params),
    byId: (id: string) => `${API_PREFIX}/users/${id}`,
    update: (id: string) => `${API_PREFIX}/users/${id}`,
    remove: (id: string) => `${API_PREFIX}/users/${id}`,
  },

} as const;
