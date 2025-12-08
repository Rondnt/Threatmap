import api from './api';

export const reportService = {
  async getAll() {
    const response = await api.get('/reports');
    return response.data;
  },

  async generate(data) {
    const response = await api.post('/reports/generate', data);
    return response.data;
  },

  async download(reportId) {
    const response = await api.get(`/reports/${reportId}/download`, {
      responseType: 'blob'
    });
    return response;
  },

  async delete(reportId) {
    const response = await api.delete(`/reports/${reportId}`);
    return response.data;
  }
};
