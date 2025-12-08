import api from './api';

export const alertService = {
  async getAll(status = 'active') {
    const response = await api.get('/alerts', { params: { status } });
    return response.data;
  },

  async getStatistics() {
    const response = await api.get('/alerts/statistics');
    return response.data;
  },

  async markAsRead(alertId) {
    const response = await api.patch(`/alerts/${alertId}/read`);
    return response.data;
  },

  async acknowledge(alertId, userId) {
    const response = await api.patch(`/alerts/${alertId}/acknowledge`, { userId });
    return response.data;
  },

  async resolve(alertId) {
    const response = await api.patch(`/alerts/${alertId}/resolve`);
    return response.data;
  },

  async dismiss(alertId) {
    const response = await api.patch(`/alerts/${alertId}/dismiss`);
    return response.data;
  }
};
