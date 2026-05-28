import api from './api';

class InvoiceService {
  async getInvoices(params = {}) {
    const response = await api.get('/invoices/', { params });
    return response.data;
  }
}

export default new InvoiceService();