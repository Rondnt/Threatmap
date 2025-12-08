import api from './api';

export const riskService = {
  async getAll(params = {}) {
    const response = await api.get('/risks', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/risks/${id}`);
    return response.data;
  },

  async create(riskData) {
    const response = await api.post('/risks', riskData);
    return response.data;
  },

  async update(id, riskData) {
    const response = await api.put(`/risks/${id}`, riskData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/risks/${id}`);
    return response.data;
  },

  async calculate(probability, impact) {
    const response = await api.post('/risks/calculate', { probability, impact });
    return response.data;
  },

  async getMatrix() {
    const response = await api.get('/risks/matrix');
    return response.data;
  },

  async getPrioritized(limit = 10) {
    const response = await api.get('/risks/prioritized', { params: { limit } });
    return response.data;
  }
};
