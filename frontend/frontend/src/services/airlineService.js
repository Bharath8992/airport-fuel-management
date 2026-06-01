import api from './api';

class AirlineService {
  async getAirlines(params = {}) {
    const response = await api.get('/airlines/', { params });
    return response.data;
  }

  async getAirline(id) {
    const response = await api.get(`/airlines/${id}/`);
    return response.data;
  }

  async createAirline(data) {
    const response = await api.post('/airlines/', data);
    return response.data;
  }

  async updateAirline(id, data) {
    const response = await api.put(`/airlines/${id}/`, data);
    return response.data;
  }

  async deleteAirline(id) {
    const response = await api.delete(`/airlines/${id}/`);
    return response.data;
  }

  async toggleStatus(id) {
    const response = await api.post(`/airlines/${id}/toggle_status/`);
    return response.data;
  }
}

export default new AirlineService();