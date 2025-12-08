import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { alertService } from '../services/alertService';
import { toast } from 'react-toastify';
import { FaBell, FaExclamationTriangle, FaShieldAlt, FaBug, FaFilter, FaClock, FaCheck, FaTimes, FaEye } from 'react-icons/fa';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, critical, high
  const [typeFilter, setTypeFilter] = useState('all'); // all, risk, threat, vulnerability
  const [statusFilter, setStatusFilter] = useState('active'); // active, resolved, dismissed, all

  useEffect(() => {
    loadAlerts();
  }, [statusFilter]); // Reload when status filter changes

  const loadAlerts = async () => {
    try {
      const [alertsRes, statsRes] = await Promise.all([
        alertService.getAll(statusFilter),
        alertService.getStatistics()
      ]);

      setAlerts(alertsRes.data?.alerts || []);
      setStatistics(statsRes.data || null);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast.error('Error al cargar alertas');
    } finally {
      setLoading(false);
    }
  };

  // Handle alert actions
  const handleMarkAsRead = async (alertId) => {
    try {
      await alertService.markAsRead(alertId);
      toast.success('Alerta marcada como leída');

      // Update the alert in the local state instead of reloading
      setAlerts(prevAlerts =>
        prevAlerts.map(alert =>
          alert.id === alertId
            ? { ...alert, is_read: true }
            : alert
        )
      );
    } catch (error) {
      console.error('Error marking alert as read:', error);
      toast.error('Error al marcar alerta como leída');
    }
  };

  const handleResolve = async (alertId) => {
    try {
      await alertService.resolve(alertId);
      toast.success('Alerta resuelta');
      loadAlerts(); // Reload alerts
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error('Error al resolver alerta');
    }
  };

  const handleDismiss = async (alertId) => {
    try {
      await alertService.dismiss(alertId);
      toast.success('Alerta descartada');
      loadAlerts(); // Reload alerts
    } catch (error) {
      console.error('Error dismissing alert:', error);
      toast.error('Error al descartar alerta');
    }
  };

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const severityMatch = filter === 'all' || alert.severity === filter;
    const typeMatch = typeFilter === 'all' || alert.type === typeFilter;
    return severityMatch && typeMatch;
  });

  // Get icon for alert type
  const getAlertIcon = (type) => {
    switch (type) {
      case 'threat':
        return <FaExclamationTriangle className="text-orange-500" />;
      case 'vulnerability':
        return <FaBug className="text-purple-500" />;
      case 'risk':
        return <FaShieldAlt className="text-blue-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  // Get badge color
  const getBadgeColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    return date.toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FaBell className="mr-3 text-red-600" />
            Alertas Críticas
          </h1>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Alertas</p>
                  <p className="text-4xl font-bold text-gray-900">{statistics.totalAlerts || 0}</p>
                </div>
                <FaBell className="h-12 w-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-red-50 rounded-lg shadow p-6 border-l-4 border-red-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Críticas</p>
                  <p className="text-4xl font-bold text-red-600">{statistics.critical?.total || 0}</p>
                  <div className="text-xs text-gray-600 mt-2">
                    <p>Riesgos: {statistics.critical?.risks || 0}</p>
                    <p>Amenazas: {statistics.critical?.threats || 0}</p>
                    <p>Vulnerabilidades: {statistics.critical?.vulnerabilities || 0}</p>
                  </div>
                </div>
                <FaExclamationTriangle className="h-12 w-12 text-red-600" />
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg shadow p-6 border-l-4 border-orange-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Altas</p>
                  <p className="text-4xl font-bold text-orange-600">{statistics.high?.total || 0}</p>
                  <div className="text-xs text-gray-600 mt-2">
                    <p>Riesgos: {statistics.high?.risks || 0}</p>
                    <p>Amenazas: {statistics.high?.threats || 0}</p>
                    <p>Vulnerabilidades: {statistics.high?.vulnerabilities || 0}</p>
                  </div>
                </div>
                <FaExclamationTriangle className="h-12 w-12 text-orange-600" />
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg shadow p-6 border-l-4 border-purple-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Alertas Activas</p>
                  <p className="text-4xl font-bold text-purple-600">{filteredAlerts.length}</p>
                </div>
                <FaFilter className="h-12 w-12 text-purple-600" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaFilter className="mr-2" />
            Filtros
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Severity filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severidad
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFilter('critical')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'critical'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Críticas
                </button>
                <button
                  onClick={() => setFilter('high')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'high'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Altas
                </button>
              </div>
            </div>

            {/* Type filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    typeFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setTypeFilter('risk')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    typeFilter === 'risk'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Riesgos
                </button>
                <button
                  onClick={() => setTypeFilter('threat')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    typeFilter === 'threat'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Amenazas
                </button>
                <button
                  onClick={() => setTypeFilter('vulnerability')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    typeFilter === 'vulnerability'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Vulnerabilidades
                </button>
              </div>
            </div>

            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === 'active'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Activas
                </button>
                <button
                  onClick={() => setStatusFilter('resolved')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === 'resolved'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Resueltas
                </button>
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Todas
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FaBell className="mr-2 text-red-600" />
            Lista de Alertas ({filteredAlerts.length})
          </h2>

          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <FaBell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No hay alertas que coincidan con los filtros</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert, index) => (
                <div
                  key={alert.id || index}
                  className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4"
                  style={{
                    borderLeftColor: alert.severity === 'critical' ? '#DC2626' : '#EA580C'
                  }}
                >
                  <div className="flex items-start flex-1">
                    <div className="mr-4 mt-1">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">{alert.name}</h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getBadgeColor(alert.severity)}`}>
                          {alert.severity === 'critical' ? 'CRÍTICO' : 'ALTO'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{alert.description || 'Sin descripción'}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center text-gray-500">
                          <FaClock className="mr-2" />
                          {formatDate(alert.createdAt)}
                        </div>
                        <div>
                          <span className="text-gray-500">Tipo: </span>
                          <span className="font-medium text-gray-900 capitalize">{alert.type}</span>
                        </div>

                        {alert.type === 'risk' && alert.data && (
                          <>
                            <div>
                              <span className="text-gray-500">Probabilidad: </span>
                              <span className="font-medium text-gray-900">
                                {(parseFloat(alert.data.probability) * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Impacto: </span>
                              <span className="font-medium text-gray-900">{alert.data.impact}/10</span>
                            </div>
                          </>
                        )}

                        {alert.type === 'vulnerability' && alert.data && (
                          <>
                            {alert.data.cve_id && (
                              <div>
                                <span className="text-gray-500">CVE: </span>
                                <span className="font-medium text-gray-900">{alert.data.cve_id}</span>
                              </div>
                            )}
                            {alert.data.cvss_score && (
                              <div>
                                <span className="text-gray-500">CVSS: </span>
                                <span className="font-medium text-gray-900">{alert.data.cvss_score}</span>
                              </div>
                            )}
                          </>
                        )}

                        {alert.type === 'threat' && alert.data && (
                          <>
                            {alert.data.type && (
                              <div>
                                <span className="text-gray-500">Categoría: </span>
                                <span className="font-medium text-gray-900 capitalize">{alert.data.type}</span>
                              </div>
                            )}
                            {alert.data.source && (
                              <div>
                                <span className="text-gray-500">Fuente: </span>
                                <span className="font-medium text-gray-900">{alert.data.source}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Action Buttons - Always show */}
                      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                          title="Marcar como leída"
                        >
                          <FaEye />
                          {alert.is_read ? 'Leída' : 'Marcar Leída'}
                        </button>
                        <button
                          onClick={() => handleResolve(alert.id)}
                          className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                          title="Resolver alerta"
                        >
                          <FaCheck />
                          Resolver
                        </button>
                      </div>

                      {/* Status Badge - Show if alert is resolved */}
                      {alert.alertStatus === 'resolved' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            ✓ Resuelta
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Alerts;
