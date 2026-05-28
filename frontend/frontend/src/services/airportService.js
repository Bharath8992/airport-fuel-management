import api from './api';

class AirportService {
  async getAirports(params = {}) {
    const response = await api.get('/airports/', { params });
    return response.data;
  }
}

export default new AirportService();