import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import Modal from '../components/common/Modal';
import ThreatForm from '../components/threats/ThreatForm';
import { threatService } from '../services/threatService';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaExclamationTriangle, FaShieldAlt, FaFire, FaCheckCircle, FaDownload, FaEye, FaTh, FaList, FaSort, FaSortUp, FaSortDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Threats = () => {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingThreat, setEditingThreat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [sortField, setSortField] = useState('risk_score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  useEffect(() => {
    loadThreats();
  }, []);

  // Cerrar menú de exportación al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuOpen && !event.target.closest('.export-menu-container')) {
        setExportMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [exportMenuOpen]);

  const loadThreats = async () => {
    try {
      const response = await threatService.getAll();
      setThreats(response.data.threats || []);
    } catch (error) {
      console.error('Error loading threats:', error);
      toast.error('Error al cargar amenazas');
      setThreats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingThreat(null);
    setIsModalOpen(true);
  };

  const handleEdit = (threat) => {
    setEditingThreat(threat);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta amenaza?')) {
      return;
    }

    try {
      await threatService.delete(id);
      toast.success('Amenaza eliminada exitosamente');
      loadThreats();
    } catch (error) {
      toast.error('Error al eliminar amenaza');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingThreat) {
        await threatService.update(editingThreat.id, formData);
        toast.success('Amenaza actualizada exitosamente');
      } else {
        await threatService.create(formData);
        toast.success('Amenaza creada exitosamente');
      }
      setIsModalOpen(false);
      loadThreats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar amenaza');
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityText = (severity) => {
    const texts = {
      critical: 'Crítica',
      high: 'Alta',
      medium: 'Media',
      low: 'Baja'
    };
    return texts[severity] || severity;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-red-100 text-red-800',
      monitoring: 'bg-yellow-100 text-yellow-800',
      mitigated: 'bg-blue-100 text-blue-800',
      closed: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      active: 'Activa',
      monitoring: 'En Monitoreo',
      mitigated: 'Mitigada',
      closed: 'Cerrada'
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filtrado de amenazas
  const applyFilters = (threatsList) => {
    return threatsList.filter(threat => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          threat.name?.toLowerCase().includes(searchLower) ||
          threat.description?.toLowerCase().includes(searchLower) ||
          threat.type?.toLowerCase().includes(searchLower) ||
          threat.source?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filterType && threat.type !== filterType) return false;
      if (filterSeverity && threat.severity !== filterSeverity) return false;
      if (filterStatus && threat.status !== filterStatus) return false;

      return true;
    });
  };

  const filteredThreats = applyFilters(threats);

  // Función de ordenamiento
  const sortThreats = (threatList) => {
    return [...threatList].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'risk_score') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="inline ml-1 text-gray-400" />;
    return sortOrder === 'asc' ?
      <FaSortUp className="inline ml-1 text-indigo-600" /> :
      <FaSortDown className="inline ml-1 text-indigo-600" />;
  };

  const sortedThreats = sortThreats(filteredThreats);

  // Paginación
  const totalPages = Math.ceil(sortedThreats.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedThreats = sortedThreats.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (threat) => {
    setSelectedThreat(threat);
    setDetailsModalOpen(true);
  };

  // Exportación de datos
  const exportToJSON = () => {
    const dataStr = JSON.stringify(filteredThreats, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `amenazas_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Datos exportados a JSON exitosamente');
  };

  const exportToCSV = () => {
    const headers = ['Nombre', 'Tipo', 'Severidad', 'Estado', 'Score Riesgo', 'Fuente'];

    const csvData = filteredThreats.map(t => [
      t.name,
      t.type?.replace(/_/g, ' ') || 'N/A',
      getSeverityText(t.severity),
      getStatusText(t.status),
      t.risk_score || 'N/A',
      t.source || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    const dataBlob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `amenazas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Datos exportados a CSV exitosamente');
  };

  // Calcular estadísticas
  const statistics = {
    total: threats.length,
    active: threats.filter(t => t.status === 'active').length,
    critical: threats.filter(t => t.severity === 'critical').length,
    highRisk: threats.filter(t => (t.risk_score || 0) >= 70).length
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-3xl text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Amenazas</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Botones de vista */}
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                title="Vista de Tabla"
              >
                <FaList />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 text-sm ${viewMode === 'cards' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                title="Vista de Tarjetas"
              >
                <FaTh />
              </button>
            </div>

            {/* Botones de exportación */}
            <div className="relative export-menu-container">
              <button
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                title="Exportar datos"
              >
                <FaDownload className="mr-2" />
                Exportar
              </button>
              {exportMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <button
                    onClick={() => {
                      exportToCSV();
                      setExportMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-md"
                  >
                    Exportar a CSV
                  </button>
                  <button
                    onClick={() => {
                      exportToJSON();
                      setExportMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-md"
                  >
                    Exportar a JSON
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleCreate}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <FaPlus className="mr-2" />
              Nueva Amenaza
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Amenazas</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
              </div>
              <FaShieldAlt className="text-3xl text-indigo-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Amenazas Activas</p>
                <p className="text-2xl font-bold text-red-600">{statistics.active}</p>
              </div>
              <FaFire className="text-3xl text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Críticas</p>
                <p className="text-2xl font-bold text-red-600">{statistics.critical}</p>
              </div>
              <FaExclamationTriangle className="text-3xl text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Alto Riesgo</p>
                <p className="text-2xl font-bold text-orange-600">{statistics.highRisk}</p>
              </div>
              <FaCheckCircle className="text-3xl text-orange-500" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <input
                type="text"
                placeholder="Nombre, tipo, fuente..."
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
                <option value="malware">Malware</option>
                <option value="phishing">Phishing</option>
                <option value="ransomware">Ransomware</option>
                <option value="ddos">DDoS</option>
                <option value="sql_injection">SQL Injection</option>
                <option value="xss">XSS</option>
                <option value="mitm">Man in the Middle</option>
                <option value="insider_threat">Amenaza Interna</option>
                <option value="zero_day">Zero Day</option>
                <option value="brute_force">Fuerza Bruta</option>
                <option value="social_engineering">Ingeniería Social</option>
                <option value="other">Otro</option>
              </select>
            </div>

            {/* Filter by Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severidad</label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Todas</option>
                <option value="critical">Crítica</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>

            {/* Filter by Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Todos</option>
                <option value="active">Activa</option>
                <option value="monitoring">En Monitoreo</option>
                <option value="mitigated">Mitigada</option>
                <option value="closed">Cerrada</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || filterType || filterSeverity || filterStatus) && (
            <div className="mt-3">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('');
                  setFilterSeverity('');
                  setFilterStatus('');
                }}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="spinner"></div>
          </div>
        ) : paginatedThreats.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">
              {threats.length === 0
                ? 'No hay amenazas registradas'
                : 'No se encontraron amenazas con los filtros aplicados'}
            </p>
            {threats.length === 0 ? (
              <button
                onClick={handleCreate}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <FaPlus className="mr-2" />
                Crear Primera Amenaza
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('');
                  setFilterSeverity('');
                  setFilterStatus('');
                }}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          <>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      Nombre {getSortIcon('name')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort('type')}
                    >
                      Tipo {getSortIcon('type')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort('severity')}
                    >
                      Severidad {getSortIcon('severity')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort('status')}
                    >
                      Estado {getSortIcon('status')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort('risk_score')}
                    >
                      Riesgo {getSortIcon('risk_score')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedThreats.map((threat) => (
                    <tr key={threat.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        <div className="max-w-xs">
                          <div className="font-semibold truncate" title={threat.name}>
                            {threat.name}
                          </div>
                          {threat.description && (
                            <div className="text-xs text-gray-500 mt-1 truncate" title={threat.description}>
                              {threat.description.length > 40
                                ? threat.description.substring(0, 40) + '...'
                                : threat.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {threat.type?.replace(/_/g, ' ') || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(threat.severity)}`}>
                          {getSeverityText(threat.severity)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(threat.status)}`}>
                          {getStatusText(threat.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-sm font-bold ${
                          (threat.risk_score || 0) >= 70 ? 'text-red-600' :
                          (threat.risk_score || 0) >= 40 ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {threat.risk_score ? parseFloat(threat.risk_score).toFixed(1) : 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(threat)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver Detalles"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(threat)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Editar"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(threat.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg shadow px-4 py-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                    <span className="font-medium">{Math.min(endIndex, sortedThreats.length)}</span> de{' '}
                    <span className="font-medium">{sortedThreats.length}</span> resultados
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      <FaChevronLeft />
                    </button>

                    <div className="flex gap-1">
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-1 rounded-md ${
                                currentPage === page
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <span key={page} className="px-2">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      <FaChevronRight />
                    </button>

                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="ml-4 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={5}>5 por página</option>
                      <option value={10}>10 por página</option>
                      <option value={25}>25 por página</option>
                      <option value={50}>50 por página</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          // Vista de tarjetas
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedThreats.map((threat) => (
                <div key={threat.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-900 truncate flex-1" title={threat.name}>
                      {threat.name}
                    </h3>
                    <span className={`ml-2 px-2 py-1 text-xs font-bold rounded ${getSeverityColor(threat.severity)}`}>
                      {getSeverityText(threat.severity)}
                    </span>
                  </div>

                  {threat.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2" title={threat.description}>
                      {threat.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-700 mr-2">Tipo:</span>
                      <span className="text-gray-600 capitalize">{threat.type?.replace(/_/g, ' ') || 'N/A'}</span>
                    </div>

                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-700 mr-2">Estado:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(threat.status)}`}>
                        {getStatusText(threat.status)}
                      </span>
                    </div>

                    {threat.source && (
                      <div className="flex items-center text-sm">
                        <span className="font-medium text-gray-700 mr-2">Fuente:</span>
                        <span className="text-gray-600 truncate">{threat.source}</span>
                      </div>
                    )}

                    <div className="bg-indigo-50 rounded-lg p-2 text-center">
                      <span className="text-xs text-indigo-700 font-medium">Score de Riesgo</span>
                      <div className={`text-2xl font-bold ${
                        (threat.risk_score || 0) >= 70 ? 'text-red-600' :
                        (threat.risk_score || 0) >= 40 ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {threat.risk_score ? parseFloat(threat.risk_score).toFixed(1) : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleViewDetails(threat)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Ver Detalles"
                    >
                      <FaEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(threat)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                      title="Editar"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(threat.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Eliminar"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación para vista de tarjetas */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg shadow px-4 py-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                    <span className="font-medium">{Math.min(endIndex, sortedThreats.length)}</span> de{' '}
                    <span className="font-medium">{sortedThreats.length}</span> resultados
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      <FaChevronLeft />
                    </button>

                    <div className="flex gap-1">
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-1 rounded-md ${
                                currentPage === page
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <span key={page} className="px-2">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      <FaChevronRight />
                    </button>

                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="ml-4 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={5}>5 por página</option>
                      <option value={10}>10 por página</option>
                      <option value={25}>25 por página</option>
                      <option value={50}>50 por página</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal para crear/editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingThreat ? 'Editar Amenaza' : 'Nueva Amenaza'}
        size="lg"
      >
        <ThreatForm
          threat={editingThreat}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Modal de detalles */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Detalles de la Amenaza"
        size="lg"
      >
        {selectedThreat && (
          <div className="space-y-6">
            {/* Header con nombre y riesgo */}
            <div className="flex justify-between items-start pb-4 border-b border-gray-200">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedThreat.name}
                </h2>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Tipo:</span> <span className="capitalize">{selectedThreat.type?.replace(/_/g, ' ')}</span>
                </p>
              </div>
              <div className="ml-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-1 ${
                    (selectedThreat.risk_score || 0) >= 70 ? 'text-red-600' :
                    (selectedThreat.risk_score || 0) >= 40 ? 'text-orange-600' :
                    'text-green-600'
                  }`}>
                    {selectedThreat.risk_score ? parseFloat(selectedThreat.risk_score).toFixed(1) : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 uppercase font-semibold">Score Riesgo</div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            {selectedThreat.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Descripción</h3>
                <p className="text-gray-600 leading-relaxed">{selectedThreat.description}</p>
              </div>
            )}

            {/* Información principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Clasificación</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Severidad</span>
                    <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getSeverityColor(selectedThreat.severity)}`}>
                      {getSeverityText(selectedThreat.severity)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Estado</span>
                    <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(selectedThreat.status)}`}>
                      {getStatusText(selectedThreat.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Información Adicional</h3>
                <div className="space-y-2 text-sm">
                  {selectedThreat.source && (
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Fuente</span>
                      <span className="text-gray-900">{selectedThreat.source}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Fecha de Detección</span>
                    <span className="text-gray-900">{formatDate(selectedThreat.detected_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  handleEdit(selectedThreat);
                }}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <FaEdit className="mr-2" />
                Editar
              </button>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default Threats;
