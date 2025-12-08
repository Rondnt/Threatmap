import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import Modal from '../components/common/Modal';
import NetworkTopology from '../components/attackSurface/NetworkTopology';
import AssetForm from '../components/attackSurface/AssetForm';
import { assetService } from '../services/assetService';
import { toast } from 'react-toastify';
import { FaNetworkWired, FaPlus, FaEdit, FaTrash, FaServer, FaShieldAlt, FaDownload } from 'react-icons/fa';

const AttackSurface = () => {
  const [assets, setAssets] = useState([]);
  const [topologyData, setTopologyData] = useState({ nodes: [], links: [] });
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [viewMode, setViewMode] = useState('topology'); // topology | list
  const [hideInactive, setHideInactive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCriticality, setFilterCriticality] = useState('');
  const [filterExposure, setFilterExposure] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [assetsRes, topologyRes, statsRes] = await Promise.all([
        assetService.getAll(),
        assetService.getTopology(),
        assetService.getStatistics()
      ]);

      setAssets(assetsRes.data?.assets || []);
      setTopologyData(topologyRes.data || { nodes: [], links: [] });
      setStatistics(statsRes.data?.statistics || null);
    } catch (error) {
      console.error('Error loading attack surface data:', error);
      toast.error('Error al cargar superficie de ataque');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAsset(null);
    setIsModalOpen(true);
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este asset?')) {
      return;
    }

    try {
      await assetService.delete(id);
      toast.success('Asset eliminado exitosamente');
      loadData();
    } catch (error) {
      toast.error('Error al eliminar asset');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingAsset) {
        await assetService.update(editingAsset.id, formData);
        toast.success('Asset actualizado exitosamente');
      } else {
        await assetService.create(formData);
        toast.success('Asset creado exitosamente');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar asset');
    }
  };

  const handleNodeClick = (node) => {
    const asset = assets.find(a => a.id === node.id);
    setSelectedAsset(asset);
  };

  const handleNodeDrag = async (nodeId, position) => {
    try {
      await assetService.updatePosition(nodeId, position);
    } catch (error) {
      console.error('Error updating position:', error);
    }
  };

  const handleExportTopology = () => {
    const svgElement = document.querySelector('#network-topology-svg');
    if (!svgElement) {
      toast.error('No se pudo encontrar la topología para exportar');
      return;
    }

    // Crear un canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgRect = svgElement.getBoundingClientRect();

    canvas.width = svgRect.width * 2; // 2x para mejor calidad
    canvas.height = svgRect.height * 2;

    // Fondo blanco
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Convertir SVG a imagen
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      // Descargar
      canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.download = `topologia-superficie-ataque-${new Date().toISOString().split('T')[0]}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        toast.success('Topología exportada exitosamente');
      });
    };

    img.src = url;
  };

  const getCriticalityColor = (criticality) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[criticality] || 'bg-gray-100 text-gray-800';
  };

  const getExposureColor = (exposure) => {
    const colors = {
      public: 'bg-red-100 text-red-800',
      dmz: 'bg-orange-100 text-orange-800',
      internal: 'bg-blue-100 text-blue-800',
      isolated: 'bg-gray-100 text-gray-800'
    };
    return colors[exposure] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      decommissioned: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      active: 'Activo',
      inactive: 'Inactivo',
      maintenance: 'Mantenimiento',
      decommissioned: 'Dado de Baja'
    };
    return texts[status] || status;
  };

  // Función de filtrado completa
  const applyFilters = (assetsList) => {
    return assetsList.filter(asset => {
      // Filtro de inactivos
      if (hideInactive && asset.status === 'inactive') return false;

      // Filtro de búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          asset.name?.toLowerCase().includes(searchLower) ||
          asset.ip_address?.toLowerCase().includes(searchLower) ||
          asset.hostname?.toLowerCase().includes(searchLower) ||
          asset.description?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Filtro de tipo
      if (filterType && asset.type !== filterType) return false;

      // Filtro de criticidad
      if (filterCriticality && asset.criticality !== filterCriticality) return false;

      // Filtro de exposición
      if (filterExposure && asset.exposure_level !== filterExposure) return false;

      return true;
    });
  };

  // Filtrar datos de topología según todos los filtros
  const filteredNodes = applyFilters(topologyData.nodes);
  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

  const filteredTopologyData = {
    nodes: filteredNodes,
    links: topologyData.links.filter(link => {
      const sourceId = link.source?.id || link.source;
      const targetId = link.target?.id || link.target;
      return filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId);
    })
  };

  // Filtrar assets en vista de lista
  const filteredAssets = applyFilters(assets);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FaNetworkWired className="text-3xl text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Superficie de Ataque</h1>
          </div>
          <div className="flex space-x-3">
            <div className="btn-group">
              <button
                onClick={() => setViewMode('topology')}
                className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                  viewMode === 'topology'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Topología
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Lista
              </button>
            </div>
            <button
              onClick={() => setHideInactive(!hideInactive)}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md border ${
                hideInactive
                  ? 'bg-gray-600 text-white border-gray-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              title={hideInactive ? 'Mostrar inactivos' : 'Ocultar inactivos'}
            >
              {hideInactive ? 'Mostrar Inactivos' : 'Ocultar Inactivos'}
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <FaPlus className="mr-2" />
              Nuevo Asset
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <input
                type="text"
                placeholder="Nombre, IP, hostname..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filter by Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Todos</option>
                <option value="server">Server</option>
                <option value="database">Database</option>
                <option value="firewall">Firewall</option>
                <option value="load_balancer">Load Balancer</option>
                <option value="network_device">Network Device</option>
                <option value="workstation">Workstation</option>
                <option value="application">Application</option>
                <option value="api">API</option>
                <option value="cloud_service">Cloud Service</option>
                <option value="iot_device">IoT Device</option>
                <option value="mobile_device">Mobile Device</option>
                <option value="web_service">Web Service</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Filter by Criticality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Criticidad</label>
              <select
                value={filterCriticality}
                onChange={(e) => setFilterCriticality(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Todas</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Filter by Exposure */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exposición</label>
              <select
                value={filterExposure}
                onChange={(e) => setFilterExposure(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Todas</option>
                <option value="public">Public</option>
                <option value="dmz">DMZ</option>
                <option value="internal">Internal</option>
                <option value="isolated">Isolated</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || filterType || filterCriticality || filterExposure) && (
            <div className="mt-3">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('');
                  setFilterCriticality('');
                  setFilterExposure('');
                }}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Assets</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.total || 0}</p>
                </div>
                <FaServer className="h-10 w-10 text-indigo-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Expuestos Públicamente</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.public_facing || 0}</p>
                </div>
                <FaNetworkWired className="h-10 w-10 text-red-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Con Vulnerabilidades</p>
                  <p className="text-2xl font-bold text-orange-600">{statistics.with_vulnerabilities || 0}</p>
                </div>
                <FaShieldAlt className="h-10 w-10 text-orange-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Criticidad Alta/Crítica</p>
                  <p className="text-2xl font-bold text-red-600">
                    {(statistics.by_criticality?.critical || 0) + (statistics.by_criticality?.high || 0)}
                  </p>
                </div>
                <FaShieldAlt className="h-10 w-10 text-red-500" />
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="spinner"></div>
          </div>
        ) : viewMode === 'topology' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Topology Visualization */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Topología de Red</h2>
                  {filteredTopologyData.nodes.length > 0 && (
                    <button
                      onClick={handleExportTopology}
                      className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                      title="Exportar como imagen"
                    >
                      <FaDownload className="mr-2" />
                      Exportar PNG
                    </button>
                  )}
                </div>
                {filteredTopologyData.nodes.length === 0 ? (
                  <div className="text-center p-12 bg-gray-50 rounded-lg">
                    <FaNetworkWired className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">
                      {hideInactive && topologyData.nodes.length > 0
                        ? 'Todos los assets están inactivos'
                        : 'No hay assets registrados para visualizar'}
                    </p>
                    <p className="text-gray-500 mt-2">
                      {hideInactive && topologyData.nodes.length > 0
                        ? 'Haz clic en "Mostrar Inactivos" para verlos'
                        : 'Haz clic en "Nuevo Asset" arriba para comenzar'}
                    </p>
                  </div>
                ) : (
                  <div className="h-[600px]">
                    <NetworkTopology
                      data={filteredTopologyData}
                      onNodeClick={handleNodeClick}
                      onNodeDrag={handleNodeDrag}
                    />
                  </div>
                )}
                <div className="mt-4">
                  <div className="text-xs text-gray-500 mb-2">Leyenda (haz clic para filtrar por criticidad):</div>
                  <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600">
                    <button
                      onClick={() => setFilterCriticality(filterCriticality === 'critical' ? '' : 'critical')}
                      className={`flex items-center px-2 py-1 rounded transition-all ${
                        filterCriticality === 'critical' ? 'bg-red-100 ring-2 ring-red-500' : 'hover:bg-gray-100'
                      }`}
                      title="Click para filtrar por Crítica"
                    >
                      <div className="w-4 h-4 rounded-full bg-red-600 mr-2"></div>
                      <span>Crítica</span>
                    </button>
                    <button
                      onClick={() => setFilterCriticality(filterCriticality === 'high' ? '' : 'high')}
                      className={`flex items-center px-2 py-1 rounded transition-all ${
                        filterCriticality === 'high' ? 'bg-orange-100 ring-2 ring-orange-500' : 'hover:bg-gray-100'
                      }`}
                      title="Click para filtrar por Alta"
                    >
                      <div className="w-4 h-4 rounded-full bg-orange-600 mr-2"></div>
                      <span>Alta</span>
                    </button>
                    <button
                      onClick={() => setFilterCriticality(filterCriticality === 'medium' ? '' : 'medium')}
                      className={`flex items-center px-2 py-1 rounded transition-all ${
                        filterCriticality === 'medium' ? 'bg-yellow-100 ring-2 ring-yellow-500' : 'hover:bg-gray-100'
                      }`}
                      title="Click para filtrar por Media"
                    >
                      <div className="w-4 h-4 rounded-full bg-yellow-600 mr-2"></div>
                      <span>Media</span>
                    </button>
                    <button
                      onClick={() => setFilterCriticality(filterCriticality === 'low' ? '' : 'low')}
                      className={`flex items-center px-2 py-1 rounded transition-all ${
                        filterCriticality === 'low' ? 'bg-green-100 ring-2 ring-green-500' : 'hover:bg-gray-100'
                      }`}
                      title="Click para filtrar por Baja"
                    >
                      <div className="w-4 h-4 rounded-full bg-green-600 mr-2"></div>
                      <span>Baja</span>
                    </button>
                    <div className="flex items-center ml-4 px-2">
                      <div className="w-4 h-4 rounded-full border-4 border-red-600 mr-2"></div>
                      <span>Expuesto Públicamente</span>
                    </div>
                    <div className="flex items-center px-2">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-400 border-dashed mr-2" style={{ opacity: 0.4 }}></div>
                      <span>Inactivo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Asset Details Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-4 sticky top-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Detalles del Asset</h3>
                {selectedAsset ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Nombre</p>
                      <p className="text-sm font-medium text-gray-900">{selectedAsset.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tipo</p>
                      <p className="text-sm text-gray-900">{selectedAsset.type}</p>
                    </div>
                    {selectedAsset.ip_address && (
                      <div>
                        <p className="text-xs text-gray-500">IP</p>
                        <p className="text-sm text-gray-900">{selectedAsset.ip_address}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Criticidad</p>
                      <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getCriticalityColor(selectedAsset.criticality)}`}>
                        {selectedAsset.criticality}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Exposición</p>
                      <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getExposureColor(selectedAsset.exposure_level)}`}>
                        {selectedAsset.exposure_level}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Vulnerabilidades</p>
                      <p className="text-sm font-bold text-red-600">{selectedAsset.vulnerabilities_count || 0}</p>
                    </div>
                    <div className="pt-3 space-y-2">
                      <button
                        onClick={() => handleEdit(selectedAsset)}
                        className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                      >
                        <FaEdit className="mr-2" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(selectedAsset.id)}
                        className="w-full flex items-center justify-center px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                      >
                        <FaTrash className="mr-2" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">
                    Haz clic en un nodo para ver detalles
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {filteredAssets.length === 0 ? (
              <div className="text-center p-12 bg-gray-50">
                <FaServer className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">
                  {hideInactive && assets.length > 0
                    ? 'Todos los assets están inactivos'
                    : 'No hay assets registrados'}
                </p>
                {hideInactive && assets.length > 0 && (
                  <p className="text-gray-500 mt-2">Haz clic en "Mostrar Inactivos" para verlos</p>
                )}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP/Hostname</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criticidad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exposición</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vulnerabilidades</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{asset.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{asset.type}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {asset.ip_address || asset.hostname || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getCriticalityColor(asset.criticality)}`}>
                          {asset.criticality}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getExposureColor(asset.exposure_level)}`}>
                          {asset.exposure_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusColor(asset.status)}`}>
                          {getStatusText(asset.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-red-600">
                        {asset.vulnerabilities_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(asset)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(asset.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modal for create/edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAsset ? 'Editar Asset' : 'Nuevo Asset'}
        size="xl"
      >
        <AssetForm
          asset={editingAsset}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          allAssets={assets}
        />
      </Modal>
    </Layout>
  );
};

export default AttackSurface;
