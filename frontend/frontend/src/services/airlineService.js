// services/airlineService.js
import api from './api';

class AirlineService {
  // CRUD Operations
  async getAirlines(params = {}) {
    const response = await api.get('/airlines/', { 
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

  async partialUpdateAirline(id, data) {
    const response = await api.patch(`/airlines/${id}/`, data);
    return response.data;
  }

  async deleteAirline(id) {
    const response = await api.delete(`/airlines/${id}/`);
    return response.data;
  }

  // Additional Actions
  async toggleStatus(id) {
    const response = await api.post(`/airlines/${id}/toggle_status/`);
    return response.data;
  }

  async getStats() {
    const response = await api.get('/airlines/stats/');
    return response.data;
  }

  // Bulk Operations
  async bulkCreate(airlines) {
    const response = await api.post('/airlines/bulk_create/', { airlines });
    return response.data;
  }

  async bulkDelete(ids) {
    const response = await api.delete('/airlines/bulk_delete/', { data: { ids } });
    return response.data;
  }
}

export default new AirlineService();