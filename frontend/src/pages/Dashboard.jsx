import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { threatService } from '../services/threatService';
import { vulnerabilityService } from '../services/vulnerabilityService';
import { riskService } from '../services/riskService';
import { assetService } from '../services/assetService';
import { FaExclamationTriangle, FaShieldAlt, FaChartLine, FaBug, FaServer, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    threats: null,
    vulnerabilities: null,
    risks: null,
    attackSurface: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const [threatsRes, vulnsRes, risksRes, assetsRes] = await Promise.all([
        threatService.getAll().catch(() => ({ data: { threats: [] } })),
        vulnerabilityService.getAll().catch(() => ({ data: { vulnerabilities: [] } })),
        riskService.getAll().catch(() => ({ data: { risks: [] } })),
        assetService.getAll().catch(() => ({ data: { assets: [] } }))
      ]);

      // Extract data with correct structure for each service
      const threatsData = threatsRes.data?.data?.threats || threatsRes.data?.threats || [];
      const vulnsData = vulnsRes.data?.data?.vulnerabilities || vulnsRes.data?.vulnerabilities || [];
      const risksData = risksRes.data?.data?.risks || risksRes.data?.risks || [];

      // Assets puede venir en múltiples formatos
      let assetsData = [];
      if (assetsRes.data?.data?.assets) {
        assetsData = assetsRes.data.data.assets;
      } else if (assetsRes.data?.assets) {
        assetsData = assetsRes.data.assets;
      } else if (Array.isArray(assetsRes.data?.data)) {
        assetsData = assetsRes.data.data;
      } else if (Array.isArray(assetsRes.data)) {
        assetsData = assetsRes.data;
      }

      console.log('Assets Data:', assetsData, 'Length:', assetsData.length);

      setStats({
        threats: threatsData,
        vulnerabilities: vulnsData,
        risks: risksData,
        attackSurface: assetsData
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate threat severity counts
  const threatSeverityCounts = (stats.threats || []).reduce((acc, threat) => {
    acc[threat.severity] = (acc[threat.severity] || 0) + 1;
    return acc;
  }, {});

  // Calculate vulnerability severity counts
  const vulnSeverityCounts = (stats.vulnerabilities || []).reduce((acc, vuln) => {
    acc[vuln.severity] = (acc[vuln.severity] || 0) + 1;
    return acc;
  }, {});

  // Calculate risk level counts
  const riskLevelCounts = (stats.risks || []).reduce((acc, risk) => {
    acc[risk.risk_level] = (acc[risk.risk_level] || 0) + 1;
    return acc;
  }, {});

  // Prepare data for charts
  const threatChartData = [
    { name: 'Crítica', value: threatSeverityCounts.critical || 0, color: '#DC2626' },
    { name: 'Alta', value: threatSeverityCounts.high || 0, color: '#EA580C' },
    { name: 'Media', value: threatSeverityCounts.medium || 0, color: '#CA8A04' },
    { name: 'Baja', value: threatSeverityCounts.low || 0, color: '#16A34A' }
  ];

  const vulnChartData = [
    { name: 'Crítica', value: vulnSeverityCounts.critical || 0, color: '#DC2626' },
    { name: 'Alta', value: vulnSeverityCounts.high || 0, color: '#EA580C' },
    { name: 'Media', value: vulnSeverityCounts.medium || 0, color: '#CA8A04' },
    { name: 'Baja', value: vulnSeverityCounts.low || 0, color: '#16A34A' }
  ];

  const riskChartData = [
    { name: 'Crítico', value: riskLevelCounts.critical || 0, color: '#DC2626' },
    { name: 'Alto', value: riskLevelCounts.high || 0, color: '#EA580C' },
    { name: 'Medio', value: riskLevelCounts.medium || 0, color: '#CA8A04' },
    { name: 'Bajo', value: riskLevelCounts.low || 0, color: '#16A34A' }
  ];

  // Status comparison data
  const activeThreats = (stats.threats || []).filter(t => t.status === 'active').length;
  const mitigatedThreats = (stats.threats || []).filter(t => t.status === 'mitigated').length;

  const statusData = [
    {
      name: 'Amenazas',
      Activas: activeThreats,
      Mitigadas: mitigatedThreats
    },
    {
      name: 'Vulnerabilidades',
      Activas: (stats.vulnerabilities || []).filter(v => v.status === 'open').length,
      Mitigadas: (stats.vulnerabilities || []).filter(v => v.status === 'patched').length
    }
  ];

  // Calculate health score
  const totalThreats = (stats.threats || []).length;
  const totalVulns = (stats.vulnerabilities || []).length;
  const patchedVulns = (stats.vulnerabilities || []).filter(v => v.status === 'patched').length;

  const threatHealthScore = totalThreats > 0 ? ((mitigatedThreats / totalThreats) * 100).toFixed(0) : 100;
  const vulnHealthScore = totalVulns > 0 ? ((patchedVulns / totalVulns) * 100).toFixed(0) : 100;
  const overallHealthScore = ((parseFloat(threatHealthScore) + parseFloat(vulnHealthScore)) / 2).toFixed(0);

  // Get recent items (last 5) - Combine all types and sort by date (use most recent update or creation)
  const recentItems = [
    ...(stats.threats || []).map(t => {
      const createdDate = new Date(t.createdAt || t.created_at || 0);
      const updatedDate = new Date(t.updatedAt || t.updated_at || 0);
      const mostRecentDate = updatedDate > createdDate ? updatedDate : createdDate;

      return {
        type: 'threat',
        icon: 'threat',
        name: t.name,
        severity: t.severity,
        date: mostRecentDate,
        color: 'orange'
      };
    }),
    ...(stats.vulnerabilities || []).map(v => {
      const createdDate = new Date(v.discovered_at || v.createdAt || 0);
      const updatedDate = new Date(v.updatedAt || v.updated_at || 0);
      const mostRecentDate = updatedDate > createdDate ? updatedDate : createdDate;

      return {
        type: 'vulnerability',
        icon: 'bug',
        name: v.name,
        severity: v.severity,
        cve_id: v.cve_id,
        date: mostRecentDate,
        color: 'purple'
      };
    }),
    ...(stats.risks || []).map(r => {
      const createdDate = new Date(r.createdAt || r.created_at || 0);
      const updatedDate = new Date(r.updatedAt || r.updated_at || 0);
      const mostRecentDate = updatedDate > createdDate ? updatedDate : createdDate;

      return {
        type: 'risk',
        icon: 'shield',
        name: r.name,
        severity: r.risk_level,
        date: mostRecentDate,
        color: 'blue'
      };
    })
  ]
    .sort((a, b) => b.date - a.date)
    .slice(0, 5);

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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={loadStatistics}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <FaClock className="mr-2" />
            Actualizar
          </button>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Superficie de Ataque</p>
                <p className="text-3xl font-bold text-gray-900">{(stats.attackSurface || []).length}</p>
                <p className="text-xs text-gray-500 mt-1">Activos totales</p>
              </div>
              <FaServer className="h-12 w-12 text-teal-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Amenazas</p>
                <p className="text-3xl font-bold text-gray-900">{(stats.threats || []).length}</p>
                <p className="text-xs text-red-600 mt-1">{activeThreats} activas</p>
              </div>
              <FaExclamationTriangle className="h-12 w-12 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Vulnerabilidades</p>
                <p className="text-3xl font-bold text-gray-900">{stats.vulnerabilities?.length || 0}</p>
                <p className="text-xs text-red-600 mt-1">
                  {(stats.vulnerabilities || []).filter(v => v.status === 'open').length} abiertas
                </p>
              </div>
              <FaBug className="h-12 w-12 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Riesgos</p>
                <p className="text-3xl font-bold text-gray-900">{stats.risks?.length || 0}</p>
                <p className="text-xs text-orange-600 mt-1">
                  {(riskLevelCounts.critical || 0) + (riskLevelCounts.high || 0)} alto riesgo
                </p>
              </div>
              <FaShieldAlt className="h-12 w-12 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Health Score */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Score de Salud del Sistema</h2>
              <p className="text-blue-100">Basado en amenazas mitigadas y vulnerabilidades parcheadas</p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold">{overallHealthScore}%</div>
              <div className="flex items-center justify-center mt-2">
                {overallHealthScore >= 70 ? (
                  <FaCheckCircle className="text-green-300 mr-2" />
                ) : (
                  <FaTimesCircle className="text-red-300 mr-2" />
                )}
                <span className="text-sm">
                  {overallHealthScore >= 70 ? 'Saludable' : 'Requiere atención'}
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
              <p className="text-sm text-blue-100">Amenazas Mitigadas</p>
              <p className="text-2xl font-bold">{threatHealthScore}%</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
              <p className="text-sm text-blue-100">Vulnerabilidades Parcheadas</p>
              <p className="text-2xl font-bold">{vulnHealthScore}%</p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Threats Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FaExclamationTriangle className="mr-2 text-orange-500" />
              Amenazas por Severidad
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={threatChartData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {threatChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Vulnerabilities Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FaBug className="mr-2 text-purple-500" />
              Vulnerabilidades por Severidad
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vulnChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Risks Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FaShieldAlt className="mr-2 text-blue-500" />
              Riesgos por Nivel
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskChartData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Status Comparison Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FaChartLine className="mr-2 text-green-500" />
              Estado: Activas vs Mitigadas
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Activas" fill="#EF4444" />
                <Bar dataKey="Mitigadas" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FaClock className="mr-2 text-gray-500" />
            Actividad Reciente
          </h2>
          <div className="space-y-3">
            {recentItems.length > 0 ? (
              recentItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    {item.icon === 'threat' && <FaExclamationTriangle className="text-orange-500 mr-3" />}
                    {item.icon === 'bug' && <FaBug className="text-purple-500 mr-3" />}
                    {item.icon === 'shield' && <FaShieldAlt className="text-blue-500 mr-3" />}
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.type === 'vulnerability' && item.cve_id ? `CVE: ${item.cve_id}` :
                         item.type === 'threat' ? 'Amenaza' :
                         item.type === 'risk' ? 'Riesgo' : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      item.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      item.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      item.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      item.severity === 'low' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.severity === 'critical' ? 'Crítica' :
                       item.severity === 'high' ? 'Alta' :
                       item.severity === 'medium' ? 'Media' :
                       item.severity === 'low' ? 'Baja' : item.severity}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <a
            href="/attack-surface"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center group"
          >
            <FaServer className="h-10 w-10 text-teal-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900">Superficie de Ataque</h3>
            <p className="text-sm text-gray-500 mt-1">Gestionar activos</p>
          </a>
          <a
            href="/threats"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center group"
          >
            <FaExclamationTriangle className="h-10 w-10 text-orange-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900">Amenazas</h3>
            <p className="text-sm text-gray-500 mt-1">Ver todas</p>
          </a>
          <a
            href="/vulnerabilities"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center group"
          >
            <FaBug className="h-10 w-10 text-purple-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900">Vulnerabilidades</h3>
            <p className="text-sm text-gray-500 mt-1">Ver todas</p>
          </a>
          <a
            href="/risks"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center group"
          >
            <FaShieldAlt className="h-10 w-10 text-blue-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900">Riesgos</h3>
            <p className="text-sm text-gray-500 mt-1">Ver todos</p>
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
