import api from './api';

class TransactionService {
  async getTransactions(params = {}) {
    const response = await api.get('/transactions/', { params });
    return response.data;
  }
}

export default new TransactionService();