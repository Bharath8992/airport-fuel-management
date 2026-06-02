// services/airportService.js
import api from './api';

class AirportService {
  // CRUD Operations
  async getAirports(params = {}) {
    const response = await api.get('/airports/', { 
      params: {
        page: params.page || 1,
        page_size: params.page_size || 10,
        search: params.search || '',
        status: params.status,
        ordering: params.ordering || '-created_at',
        ...params.filters
      }
    });
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

  async partialUpdateAirport(id, data) {
    const response = await api.patch(`/airports/${id}/`, data);
    return response.data;
  }

  async deleteAirport(id) {
    const response = await api.delete(`/airports/${id}/`);
    return response.data;
  }

  // Additional Actions
  async toggleStatus(id) {
    const response = await api.post(`/airports/${id}/toggle_status/`);
    return response.data;
  }

  async updateFuelStock(id, current_fuel_stock) {
    const response = await api.post(`/airports/${id}/update_fuel_stock/`, { current_fuel_stock });
    return response.data;
  }

  async getStats() {
    const response = await api.get('/airports/stats/');
    return response.data;
  }

  async getLowFuelAlerts() {
    const response = await api.get('/airports/low_fuel_alerts/');
    return response.data;
  }

  // Bulk Operations
  async bulkCreate(airports) {
    const response = await api.post('/airports/bulk_create/', { airports });
    return response.data;
  }

  async bulkDelete(ids) {
    const response = await api.delete('/airports/bulk_delete/', { data: { ids } });
    return response.data;
  }
}

export default new AirportService();