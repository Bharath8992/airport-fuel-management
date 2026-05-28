import api from './api';

class DashboardService {
  async getStats() {
    const response = await api.get('/transactions/dashboard_stats/');
    return response.data;
  }
}

export default new DashboardService();