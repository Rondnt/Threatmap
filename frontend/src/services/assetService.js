import api from './api';

export const assetService = {
  async getAll(params = {}) {
    const response = await api.get('/assets', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },

  async create(assetData) {
    const response = await api.post('/assets', assetData);
    return response.data;
  },

  async update(id, assetData) {
    const response = await api.put(`/assets/${id}`, assetData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  },

  async getStatistics() {
    const response = await api.get('/assets/statistics');
    return response.data;
  },

  async getTopology() {
    const response = await api.get('/assets/topology');
    return response.data;
  },

  async updatePosition(id, position) {
    const response = await api.patch(`/assets/${id}/position`, position);
    return response.data;
  }
};
