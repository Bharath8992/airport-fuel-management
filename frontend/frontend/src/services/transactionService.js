import api from './api';

class TransactionService {
  async getTransactions(params = {}) {
    const response = await api.get('/transactions/', { params });
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

  async deleteTransaction(id) {
    const response = await api.delete(`/transactions/${id}/`);
    return response.data;
  }

  async updateStatus(id, status, invoice_number = null) {
    const response = await api.post(`/transactions/${id}/update_status/`, {
      status,
      invoice_number
    });
    return response.data;
  }

  async getSummary() {
    const response = await api.get('/transactions/summary/');
    return response.data;
  }
}

export default new TransactionService();