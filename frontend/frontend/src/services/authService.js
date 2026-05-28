import api from './api';

class AuthService {
  async login(credentials) {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  }

  async getCurrentUser() {
    const response = await api.get('/auth/profile/');
    return response.data;
  }

  async logout() {
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}

export default new AuthService();