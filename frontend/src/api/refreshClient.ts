import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Isolated Axios instance specifically for /auth/refresh and /auth/logout.
 * Contains NO response interceptors to prevent infinite retry recursion.
 */
export const refreshClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
