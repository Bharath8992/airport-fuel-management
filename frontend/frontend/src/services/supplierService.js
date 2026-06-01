// services/supplierService.js
import api from './api';

class SupplierService {
  // CRUD Operations
  async getSuppliers(params = {}) {
    const response = await api.get('/suppliers/', { 
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

  async getSupplier(id) {
    const response = await api.get(`/suppliers/${id}/`);
    return response.data;
  }

  async createSupplier(data) {
    const response = await api.post('/suppliers/', data);
    return response.data;
  }

  async updateSupplier(id, data) {
    const response = await api.put(`/suppliers/${id}/`, data);
    return response.data;
  }

  async partialUpdateSupplier(id, data) {
    const response = await api.patch(`/suppliers/${id}/`, data);
    return response.data;
  }

  async deleteSupplier(id) {
    const response = await api.delete(`/suppliers/${id}/`);
    return response.data;
  }

  // Additional Actions
  async toggleStatus(id) {
    const response = await api.post(`/suppliers/${id}/toggle_status/`);
    return response.data;
  }

  async getContracts(supplierId, activeOnly = false) {
    const params = activeOnly ? { active: true } : {};
    const response = await api.get(`/suppliers/${supplierId}/contracts/`, { params });
    return response.data;
  }

  async addContract(supplierId, data) {
    const response = await api.post(`/suppliers/${supplierId}/add_contract/`, data);
    return response.data;
  }

  async getStats() {
    const response = await api.get('/suppliers/stats/');
    return response.data;
  }

  // Bulk Operations
  async bulkCreate(suppliers) {
    const response = await api.post('/suppliers/bulk_create/', { suppliers });
    return response.data;
  }

  async bulkDelete(ids) {
    const response = await api.delete('/suppliers/bulk_delete/', { data: { ids } });
    return response.data;
  }

  // Export/Import
  async exportSuppliers(params = {}) {
    const response = await api.get('/suppliers/export/', { 
      params,
      responseType: 'blob' 
    });
    return response.data;
  }

  async importSuppliers(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/suppliers/import/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
}

export default new SupplierService();