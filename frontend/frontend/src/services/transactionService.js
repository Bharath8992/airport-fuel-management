// services/transactionService.js
import api from './api';

class TransactionService {
  // CRUD Operations
  async getTransactions(params = {}) {
    const response = await api.get('/transactions/', { 
      params: {
        page: params.page || 1,
        page_size: params.page_size || 10,
        search: params.search || '',
        status: params.status,
        fuel_type: params.fuel_type,
        supplier: params.supplier,
        airline: params.airline,
        airport: params.airport,
        ordering: params.ordering || '-transaction_date',
        ...params.filters
      }
    });
    return response.data;
  }

  async getTransaction(id) {
    const response = await api.get(`/transactions/${id}/`);
    return response.data;
  }

  async createTransaction(data) {
    const response = await api.post('/transactions/', data);
    return response.data;
  }

  async updateTransaction(id, data) {
    const response = await api.put(`/transactions/${id}/`, data);
    return response.data;
  }

  async partialUpdateTransaction(id, data) {
    const response = await api.patch(`/transactions/${id}/`, data);
    return response.data;
  }

  async deleteTransaction(id) {
    const response = await api.delete(`/transactions/${id}/`);
    return response.data;
  }

  // Additional Actions
  async updateStatus(id, status) {
    const response = await api.post(`/transactions/${id}/update_status/`, { status });
    return response.data;
  }

  async generateInvoice(id) {
    const response = await api.post(`/transactions/${id}/generate_invoice/`);
    return response.data;
  }

  async getStats() {
    const response = await api.get('/transactions/stats/');
    return response.data;
  }

  // Bulk Operations
  async bulkCreate(transactions) {
    const response = await api.post('/transactions/bulk_create/', { transactions });
    return response.data;
  }

  async bulkDelete(ids) {
    const response = await api.delete('/transactions/bulk_delete/', { data: { ids } });
    return response.data;
  }
}

export default new TransactionService();