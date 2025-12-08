import api from './api';

export const authService = {
  async login(email, password) {
    console.log('[AuthService] Login attempt for:', email);
    const response = await api.post('/auth/login', { email, password });
    console.log('[AuthService] Login response:', response.data);
    if (response.data.success) {
      const token = response.data.data.token;
      const user = response.data.data.user;
      console.log('[AuthService] Saving token to localStorage:', token);
      console.log('[AuthService] Saving user to localStorage:', user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('[AuthService] Token saved. Verifying:', localStorage.getItem('token') ? 'SUCCESS' : 'FAILED');
    }
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};
