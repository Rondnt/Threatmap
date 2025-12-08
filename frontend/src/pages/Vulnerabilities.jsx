import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import Modal from '../components/common/Modal';
import VulnerabilityForm from '../components/vulnerabilities/VulnerabilityForm';
import { vulnerabilityService } from '../services/vulnerabilityService';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaBug, FaShieldAlt, FaExclamationCircle, FaCheckCircle, FaDownload, FaEye, FaTh, FaList, FaSort, FaSortUp, FaSortDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Vulnerabilities = () => {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVulnerability, setEditingVulnerability] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' o 'cards'
  const [sortField, setSortField] = useState('discovered_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedVulnerability, setSelectedVulnerability] = useState(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  useEffect(() => {
    loadVulnerabilities();
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

  const loadVulnerabilities = async () => {
    try {
      const response = await vulnerabilityService.getAll();
      setVulnerabilities(response.data?.data?.vulnerabilities || response.data?.vulnerabilities || []);
    } catch (error) {
      console.error('Error loading vulnerabilities:', error);
      toast.error('Error al cargar vulnerabilidades');
      setVulnerabilities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingVulnerability(null);
    setIsModalOpen(true);
  };

  const handleEdit = (vulnerability) => {
    setEditingVulnerability(vulnerability);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta vulnerabilidad?')) {
      return;
    }

    try {
      await vulnerabilityService.delete(id);
      toast.success('Vulnerabilidad eliminada exitosamente');
      loadVulnerabilities();
    } catch (error) {
      toast.error('Error al eliminar vulnerabilidad');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingVulnerability) {
        await vulnerabilityService.update(editingVulnerability.id, formData);
        toast.success('Vulnerabilidad actualizada exitosamente');
      } else {
        await vulnerabilityService.create(formData);
        toast.success('Vulnerabilidad creada exitosamente');
      }
      setIsModalOpen(false);
      loadVulnerabilities();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar vulnerabilidad');
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

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-red-100 text-red-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      patched: 'bg-green-100 text-green-800',
      accepted: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      open: 'Abierta',
      in_progress: 'En Progreso',
      patched: 'Parcheada',
      accepted: 'Aceptada'
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

  // Función de filtrado
  const applyFilters = (vulnList) => {
    return vulnList.filter(vuln => {
      // Filtro de búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          vuln.name?.toLowerCase().includes(searchLower) ||
          vuln.description?.toLowerCase().includes(searchLower) ||
          vuln.cve_id?.toLowerCase().includes(searchLower) ||
          (Array.isArray(vuln.affected_systems)
            ? vuln.affected_systems.some(sys => sys.toLowerCase().includes(searchLower))
            : vuln.affected_systems?.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Filtro de severidad
      if (filterSeverity && vuln.severity !== filterSeverity) return false;

      // Filtro de estado
      if (filterStatus && vuln.status !== filterStatus) return false;

      return true;
    });
  };

  const filteredVulnerabilities = applyFilters(vulnerabilities);

  // Función de ordenamiento
  const sortVulnerabilities = (vulnList) => {
    return [...vulnList].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Manejo especial para campos específicos
      if (sortField === 'cvss_score') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (sortField === 'discovered_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
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
      <FaSortUp className="inline ml-1 text-purple-600" /> :
      <FaSortDown className="inline ml-1 text-purple-600" />;
  };

  const sortedVulnerabilities = sortVulnerabilities(filteredVulnerabilities);

  // Paginación
  const totalPages = Math.ceil(sortedVulnerabilities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVulnerabilities = sortedVulnerabilities.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (vulnerability) => {
    setSelectedVulnerability(vulnerability);
    setDetailsModalOpen(true);
  };

  // Exportación de datos
  const exportToJSON = () => {
    const dataStr = JSON.stringify(filteredVulnerabilities, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vulnerabilidades_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('Datos exportados a JSON exitosamente');
  };

  const exportToCSV = () => {
    const headers = ['Nombre', 'CVE ID', 'Sistema Afectado', 'CVSS', 'Severidad', 'Estado', 'Fecha Descubrimiento'];

    // Traducir severidad y estado al español
    const translateSeverity = (severity) => {
      const translations = {
        'critical': 'Crítica',
        'high': 'Alta',
        'medium': 'Media',
        'low': 'Baja'
      };
      return translations[severity] || severity;
    };

    const translateStatus = (status) => {
      const translations = {
        'open': 'Abierta',
        'in_progress': 'En Progreso',
        'patched': 'Parcheada',
        'accepted': 'Aceptada'
      };
      return translations[status] || status;
    };

    const csvData = filteredVulnerabilities.map(v => [
      v.name,
      v.cve_id || 'N/A',
      Array.isArray(v.affected_systems) ? v.affected_systems.join('; ') : v.affected_systems || 'N/A',
      v.cvss_score,
      translateSeverity(v.severity),
      translateStatus(v.status),
      formatDate(v.discovered_at)
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    // Agregar BOM (Byte Order Mark) para UTF-8
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    const dataBlob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vulnerabilidades_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url); // Liberar memoria
    toast.success('Datos exportados a CSV exitosamente');
  };

  // Calcular estadísticas
  const statistics = {
    total: vulnerabilities.length,
    open: vulnerabilities.filter(v => v.status === 'open').length,
    critical: vulnerabilities.filter(v => v.severity === 'critical').length,
    highCVSS: vulnerabilities.filter(v => parseFloat(v.cvss_score) >= 7.0).length
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center">
            <FaBug className="text-3xl text-purple-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Vulnerabilidades</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Botones de vista */}
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm ${viewMode === 'table' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                title="Vista de Tabla"
              >
                <FaList />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 text-sm ${viewMode === 'cards' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
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
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <FaPlus className="mr-2" />
              Nueva Vulnerabilidad
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Vulnerabilidades</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
              </div>
              <FaShieldAlt className="text-3xl text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Abiertas</p>
                <p className="text-2xl font-bold text-red-600">{statistics.open}</p>
              </div>
              <FaExclamationCircle className="text-3xl text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Críticas</p>
                <p className="text-2xl font-bold text-red-600">{statistics.critical}</p>
              </div>
              <FaBug className="text-3xl text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">CVSS Alto (≥7.0)</p>
                <p className="text-2xl font-bold text-orange-600">{statistics.highCVSS}</p>
              </div>
              <FaCheckCircle className="text-3xl text-orange-500" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <input
                type="text"
                placeholder="Nombre, CVE, sistema afectado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Filter by Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severidad</label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Todos</option>
                <option value="open">Abierta</option>
                <option value="in_progress">En Progreso</option>
                <option value="patched">Parcheada</option>
                <option value="accepted">Aceptada</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || filterSeverity || filterStatus) && (
            <div className="mt-3">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterSeverity('');
                  setFilterStatus('');
                }}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
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
        ) : filteredVulnerabilities.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FaBug className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">
              {vulnerabilities.length === 0
                ? 'No hay vulnerabilidades registradas'
                : 'No se encontraron vulnerabilidades con los filtros aplicados'}
            </p>
            {vulnerabilities.length === 0 ? (
              <button
                onClick={handleCreate}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <FaPlus className="mr-2" />
                Crear Primera Vulnerabilidad
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterSeverity('');
                  setFilterStatus('');
                }}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">CVE ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Sistema</th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort('cvss_score')}
                    >
                      CVSS {getSortIcon('cvss_score')}
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
                      onClick={() => handleSort('discovered_at')}
                    >
                      Fecha {getSortIcon('discovered_at')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedVulnerabilities.map((vulnerability) => (
                  <tr key={vulnerability.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      <div className="max-w-xs">
                        <div className="font-semibold truncate" title={vulnerability.name}>
                          {vulnerability.name}
                        </div>
                        {vulnerability.description && (
                          <div className="text-xs text-gray-500 mt-1 truncate" title={vulnerability.description}>
                            {vulnerability.description.length > 40
                              ? vulnerability.description.substring(0, 40) + '...'
                              : vulnerability.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {vulnerability.cve_id || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <div className="max-w-[200px] truncate" title={Array.isArray(vulnerability.affected_systems) ? vulnerability.affected_systems.join(', ') : vulnerability.affected_systems || 'N/A'}>
                        {Array.isArray(vulnerability.affected_systems) ? vulnerability.affected_systems.join(', ') : vulnerability.affected_systems || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-sm font-bold ${
                        parseFloat(vulnerability.cvss_score) >= 9.0 ? 'text-red-600' :
                        parseFloat(vulnerability.cvss_score) >= 7.0 ? 'text-orange-600' :
                        parseFloat(vulnerability.cvss_score) >= 4.0 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {vulnerability.cvss_score ? parseFloat(vulnerability.cvss_score).toFixed(1) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(vulnerability.severity)}`}>
                        {vulnerability.severity === 'critical' ? 'Crítica' :
                         vulnerability.severity === 'high' ? 'Alta' :
                         vulnerability.severity === 'medium' ? 'Media' :
                         vulnerability.severity === 'low' ? 'Baja' :
                         vulnerability.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(vulnerability.status)}`}>
                        {getStatusText(vulnerability.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(vulnerability.discovered_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(vulnerability)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver Detalles"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(vulnerability)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Editar"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(vulnerability.id)}
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
                  <span className="font-medium">{Math.min(endIndex, sortedVulnerabilities.length)}</span> de{' '}
                  <span className="font-medium">{sortedVulnerabilities.length}</span> resultados
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    <FaChevronLeft />
                  </button>

                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      // Mostrar solo páginas cercanas a la actual
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
                                ? 'bg-purple-600 text-white'
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
                        : 'bg-purple-600 text-white hover:bg-purple-700'
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
                    className="ml-4 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              {paginatedVulnerabilities.map((vulnerability) => (
                <div key={vulnerability.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-900 truncate flex-1" title={vulnerability.name}>
                      {vulnerability.name}
                    </h3>
                    <span className={`ml-2 px-2 py-1 text-xs font-bold rounded ${
                      parseFloat(vulnerability.cvss_score) >= 9.0 ? 'bg-red-100 text-red-800' :
                      parseFloat(vulnerability.cvss_score) >= 7.0 ? 'bg-orange-100 text-orange-800' :
                      parseFloat(vulnerability.cvss_score) >= 4.0 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {vulnerability.cvss_score ? parseFloat(vulnerability.cvss_score).toFixed(1) : 'N/A'}
                    </span>
                  </div>

                  {vulnerability.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2" title={vulnerability.description}>
                      {vulnerability.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    {vulnerability.cve_id && (
                      <div className="flex items-center text-sm">
                        <span className="font-medium text-gray-700 mr-2">CVE:</span>
                        <span className="text-gray-600">{vulnerability.cve_id}</span>
                      </div>
                    )}

                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-700 mr-2">Sistema:</span>
                      <span className="text-gray-600 truncate" title={Array.isArray(vulnerability.affected_systems) ? vulnerability.affected_systems.join(', ') : vulnerability.affected_systems}>
                        {Array.isArray(vulnerability.affected_systems) ? vulnerability.affected_systems.join(', ') : vulnerability.affected_systems || 'N/A'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(vulnerability.severity)}`}>
                        {vulnerability.severity === 'critical' ? 'Crítica' :
                         vulnerability.severity === 'high' ? 'Alta' :
                         vulnerability.severity === 'medium' ? 'Media' :
                         vulnerability.severity === 'low' ? 'Baja' :
                         vulnerability.severity}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vulnerability.status)}`}>
                        {getStatusText(vulnerability.status)}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Descubierta:</span> {formatDate(vulnerability.discovered_at)}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleViewDetails(vulnerability)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Ver Detalles"
                    >
                      <FaEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(vulnerability)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                      title="Editar"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(vulnerability.id)}
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
                    <span className="font-medium">{Math.min(endIndex, sortedVulnerabilities.length)}</span> de{' '}
                    <span className="font-medium">{sortedVulnerabilities.length}</span> resultados
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
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
                                  ? 'bg-purple-600 text-white'
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
                          : 'bg-purple-600 text-white hover:bg-purple-700'
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
                      className="ml-4 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
        title={editingVulnerability ? 'Editar Vulnerabilidad' : 'Nueva Vulnerabilidad'}
        size="lg"
      >
        <VulnerabilityForm
          vulnerability={editingVulnerability}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Modal de detalles */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Detalles de la Vulnerabilidad"
        size="lg"
      >
        {selectedVulnerability && (
          <div className="space-y-6">
            {/* Header con nombre y CVSS */}
            <div className="flex justify-between items-start pb-4 border-b border-gray-200">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedVulnerability.name}
                </h2>
                {selectedVulnerability.cve_id && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">CVE ID:</span> {selectedVulnerability.cve_id}
                  </p>
                )}
              </div>
              <div className="ml-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-1 ${
                    parseFloat(selectedVulnerability.cvss_score) >= 9.0 ? 'text-red-600' :
                    parseFloat(selectedVulnerability.cvss_score) >= 7.0 ? 'text-orange-600' :
                    parseFloat(selectedVulnerability.cvss_score) >= 4.0 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {selectedVulnerability.cvss_score ? parseFloat(selectedVulnerability.cvss_score).toFixed(1) : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 uppercase font-semibold">CVSS Score</div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            {selectedVulnerability.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Descripción</h3>
                <p className="text-gray-600 leading-relaxed">{selectedVulnerability.description}</p>
              </div>
            )}

            {/* Información principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Clasificación</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Severidad</span>
                    <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getSeverityColor(selectedVulnerability.severity)}`}>
                      {selectedVulnerability.severity === 'critical' ? 'Crítica' :
                       selectedVulnerability.severity === 'high' ? 'Alta' :
                       selectedVulnerability.severity === 'medium' ? 'Media' :
                       selectedVulnerability.severity === 'low' ? 'Baja' :
                       selectedVulnerability.severity}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Estado</span>
                    <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(selectedVulnerability.status)}`}>
                      {getStatusText(selectedVulnerability.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Sistema Afectado</h3>
                <div className="text-sm text-gray-900">
                  {Array.isArray(selectedVulnerability.affected_systems)
                    ? selectedVulnerability.affected_systems.join(', ')
                    : selectedVulnerability.affected_systems || 'N/A'}
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-purple-900 mb-3">Información Temporal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-purple-700 block mb-1">Fecha de Descubrimiento</span>
                  <span className="text-purple-900 font-medium">{formatDate(selectedVulnerability.discovered_at)}</span>
                </div>
                <div>
                  <span className="text-xs text-purple-700 block mb-1">Última Actualización</span>
                  <span className="text-purple-900 font-medium">{formatDate(selectedVulnerability.updatedAt)}</span>
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  handleEdit(selectedVulnerability);
                }}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
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

export default Vulnerabilities;
