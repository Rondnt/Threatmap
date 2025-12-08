import api from './api';

export const threatService = {
  async getAll(params = {}) {
    const response = await api.get('/threats', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/threats/${id}`);
    return response.data;
  },

  async create(threatData) {
    const response = await api.post('/threats', threatData);
    return response.data;
  },

  async update(id, threatData) {
    const response = await api.put(`/threats/${id}`, threatData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/threats/${id}`);
    return response.data;
  },

  async getStatistics() {
    const response = await api.get('/threats/statistics');
    return response.data;
  }
};
