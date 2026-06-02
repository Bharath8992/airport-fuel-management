// services/dashboardService.js
import api from './api';

class DashboardService {
  async getStats(period = 'monthly', startDate = null, endDate = null) {
    const params = { period };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await api.get('/dashboard/stats/', { params });
    return response.data;
  }

  async getFuelTrends(period = 'weekly', year = null, month = null) {
    const params = { period };
    if (year) params.year = year;
    if (month) params.month = month;
    
    const response = await api.get('/dashboard/fuel-trends/', { params });
    return response.data;
  }

  async getRecentActivities(limit = 10) {
    const response = await api.get('/dashboard/recent-activities/', { params: { limit } });
    return response.data;
  }
}

export default new DashboardService();