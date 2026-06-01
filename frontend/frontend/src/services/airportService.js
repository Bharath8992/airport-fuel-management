import api from './api';

class AirportService {
  async getAirports(params = {}) {
    const response = await api.get('/airports/', { params });
    return response.data;
  }

  async getAirport(id) {
    const response = await api.get(`/airports/${id}/`);
    return response.data;
  }

  async createAirport(data) {
    const response = await api.post('/airports/', data);
    return response.data;
  }

  async updateAirport(id, data) {
    const response = await api.put(`/airports/${id}/`, data);
    return response.data;
  }

  async deleteAirport(id) {
    const response = await api.delete(`/airports/${id}/`);
    return response.data;
  }

  async toggleStatus(id) {
    const response = await api.post(`/airports/${id}/toggle_status/`);
    return response.data;
  }

  async updateStock(id, quantity, operation) {
    const response = await api.post(`/airports/${id}/update_stock/`, {
      quantity,
      operation
    });
    return response.data;
  }
}

export default new AirportService();