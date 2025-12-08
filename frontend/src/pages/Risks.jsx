import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import Modal from '../components/common/Modal';
import RiskForm from '../components/risks/RiskForm';
import { riskService } from '../services/riskService';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaChartLine, FaDownload, FaEye, FaTh, FaList, FaSort, FaSortUp, FaSortDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Risks = () => {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [sortField, setSortField] = useState('risk_score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  useEffect(() => {
    loadRisks();
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

  const loadRisks = async () => {
    try {
      const response = await riskService.getAll();
      setRisks(response.data?.risks || []);
    } catch (error) {
      console.error('Error loading risks:', error);
      toast.error('Error al cargar riesgos');
      setRisks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRisk(null);
    setIsModalOpen(true);
  };

  const handleEdit = (risk) => {
    setEditingRisk(risk);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este riesgo?')) {
      return;
    }

    try {
      await riskService.delete(id);
      toast.success('Riesgo eliminado exitosamente');
      loadRisks();
    } catch (error) {
      toast.error('Error al eliminar riesgo');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingRisk) {
        await riskService.update(editingRisk.id, formData);
        toast.success('Riesgo actualizado exitosamente');
      } else {
        await riskService.create(formData);
        toast.success('Riesgo creado exitosamente');
      }
      setIsModalOpen(false);
      loadRisks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar riesgo');
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getLevelText = (level) => {
    const texts = {
      critical: 'Crítico',
      high: 'Alto',
      medium: 'Medio',
      low: 'Bajo'
    };
    return texts[level] || level;
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
  const applyFilters = (riskList) => {
    return riskList.filter(risk => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          risk.name?.toLowerCase().includes(searchLower) ||
          risk.description?.toLowerCase().includes(searchLower) ||
          risk.category?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filterCategory && risk.category !== filterCategory) return false;
      if (filterLevel && risk.risk_level !== filterLevel) return false;

      return true;
    });
  };

  const filteredRisks = applyFilters(risks);

  // Función de ordenamiento
  const sortRisks = (riskList) => {
    return [...riskList].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'risk_score' || sortField === 'probability' || sortField === 'impact') {
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
      <FaSortUp className="inline ml-1 text-blue-600" /> :
      <FaSortDown className="inline ml-1 text-blue-600" />;
  };

  const sortedRisks = sortRisks(filteredRisks);

  // Paginación
  const totalPages = Math.ceil(sortedRisks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRisks = sortedRisks.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (risk) => {
    setSelectedRisk(risk);
    setDetailsModalOpen(true);
  };

  // Exportación de datos
  const exportToJSON = () => {
    const dataStr = JSON.stringify(filteredRisks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `riesgos_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Datos exportados a JSON exitosamente');
  };

  const exportToCSV = () => {
    const headers = ['Nombre', 'Categoría', 'Probabilidad', 'Impacto', 'Score', 'Nivel'];

    const csvData = filteredRisks.map(r => [
      r.name,
      r.category,
      `${(r.probability * 100).toFixed(0)}%`,
      `${r.impact}/10`,
      r.risk_score,
      getLevelText(r.risk_level)
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
    link.download = `riesgos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Datos exportados a CSV exitosamente');
  };

  // Calcular estadísticas
  const statistics = {
    total: risks.length,
    critical: risks.filter(r => r.risk_level === 'critical').length,
    high: risks.filter(r => r.risk_level === 'high').length,
    avgScore: risks.length > 0 ? (risks.reduce((sum, r) => sum + parseFloat(r.risk_score || 0), 0) / risks.length).toFixed(2) : 0
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center">
            <FaShieldAlt className="text-3xl text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Riesgos</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Botones de vista */}
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                title="Vista de Tabla"
              >
                <FaList />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 text-sm ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
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
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <FaPlus className="mr-2" />
              Nuevo Riesgo
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Riesgos</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
              </div>
              <FaShieldAlt className="text-3xl text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{statistics.critical}</p>
              </div>
              <FaExclamationTriangle className="text-3xl text-red-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Altos</p>
                <p className="text-2xl font-bold text-orange-600">{statistics.high}</p>
              </div>
              <FaChartLine className="text-3xl text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Score Promedio</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.avgScore}</p>
              </div>
              <FaCheckCircle className="text-3xl text-blue-500" />
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
                placeholder="Nombre, categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter by Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                <option value="operational">Operacional</option>
                <option value="technical">Técnico</option>
                <option value="compliance">Cumplimiento</option>
                <option value="reputational">Reputacional</option>
              </select>
            </div>

            {/* Filter by Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="critical">Crítico</option>
                <option value="high">Alto</option>
                <option value="medium">Medio</option>
                <option value="low">Bajo</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || filterCategory || filterLevel) && (
            <div className="mt-3">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('');
                  setFilterLevel('');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
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
        ) : paginatedRisks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FaShieldAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">
              {risks.length === 0
                ? 'No hay riesgos registrados'
                : 'No se encontraron riesgos con los filtros aplicados'}
            </p>
            {risks.length === 0 ? (
              <button
                onClick={handleCreate}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <FaPlus className="mr-2" />
                Crear Primer Riesgo
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('');
                  setFilterLevel('');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
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
                      onClick={() => handleSort('category')}
                    >
                      Categoría {getSortIcon('category')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort('probability')}
                    >
                      Probabilidad {getSortIcon('probability')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort('impact')}
                    >
                      Impacto {getSortIcon('impact')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort('risk_score')}
                    >
                      Score {getSortIcon('risk_score')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort('risk_level')}
                    >
                      Nivel {getSortIcon('risk_level')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedRisks.map((risk) => (
                    <tr key={risk.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        <div className="max-w-xs">
                          <div className="font-semibold truncate" title={risk.name}>
                            {risk.name}
                          </div>
                          {risk.description && (
                            <div className="text-xs text-gray-500 mt-1 truncate" title={risk.description}>
                              {risk.description.length > 40
                                ? risk.description.substring(0, 40) + '...'
                                : risk.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {risk.category}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {(risk.probability * 100).toFixed(0)}%
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {risk.impact}/10
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-blue-600">
                        {risk.risk_score ? parseFloat(risk.risk_score).toFixed(2) : 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getLevelColor(risk.risk_level)}`}>
                          {getLevelText(risk.risk_level)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(risk)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver Detalles"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(risk)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(risk.id)}
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
                    <span className="font-medium">{Math.min(endIndex, sortedRisks.length)}</span> de{' '}
                    <span className="font-medium">{sortedRisks.length}</span> resultados
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
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
                                  ? 'bg-blue-600 text-white'
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
                          : 'bg-blue-600 text-white hover:bg-blue-700'
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
                      className="ml-4 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              {paginatedRisks.map((risk) => (
                <div key={risk.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-900 truncate flex-1" title={risk.name}>
                      {risk.name}
                    </h3>
                    <span className={`ml-2 px-2 py-1 text-xs font-bold rounded ${getLevelColor(risk.risk_level)}`}>
                      {getLevelText(risk.risk_level)}
                    </span>
                  </div>

                  {risk.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2" title={risk.description}>
                      {risk.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-700 mr-2">Categoría:</span>
                      <span className="text-gray-600">{risk.category}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Probabilidad:</span>
                        <div className="text-blue-600 font-bold">{(risk.probability * 100).toFixed(0)}%</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Impacto:</span>
                        <div className="text-orange-600 font-bold">{risk.impact}/10</div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                      <span className="text-xs text-blue-700 font-medium">Score de Riesgo</span>
                      <div className="text-2xl font-bold text-blue-600">{risk.risk_score ? parseFloat(risk.risk_score).toFixed(2) : 'N/A'}</div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleViewDetails(risk)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Ver Detalles"
                    >
                      <FaEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(risk)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Editar"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(risk.id)}
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
                    <span className="font-medium">{Math.min(endIndex, sortedRisks.length)}</span> de{' '}
                    <span className="font-medium">{sortedRisks.length}</span> resultados
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
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
                                  ? 'bg-blue-600 text-white'
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
                          : 'bg-blue-600 text-white hover:bg-blue-700'
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
                      className="ml-4 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        title={editingRisk ? 'Editar Riesgo' : 'Nuevo Riesgo'}
        size="lg"
      >
        <RiskForm
          risk={editingRisk}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Modal de detalles */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Detalles del Riesgo"
        size="lg"
      >
        {selectedRisk && (
          <div className="space-y-6">
            {/* Header con nombre y nivel */}
            <div className="flex justify-between items-start pb-4 border-b border-gray-200">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedRisk.name}
                </h2>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Categoría:</span> {selectedRisk.category}
                </p>
              </div>
              <div className="ml-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-1">
                    {selectedRisk.risk_score ? parseFloat(selectedRisk.risk_score).toFixed(2) : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 uppercase font-semibold">Score</div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            {selectedRisk.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Descripción</h3>
                <p className="text-gray-600 leading-relaxed">{selectedRisk.description}</p>
              </div>
            )}

            {/* Información principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Evaluación</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Probabilidad</span>
                    <span className="text-lg font-bold text-blue-600">{(selectedRisk.probability * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Impacto</span>
                    <span className="text-lg font-bold text-orange-600">{selectedRisk.impact}/10</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Nivel de Riesgo</h3>
                <span className={`px-4 py-2 inline-flex text-base font-semibold rounded-full ${getLevelColor(selectedRisk.risk_level)}`}>
                  {getLevelText(selectedRisk.risk_level)}
                </span>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  handleEdit(selectedRisk);
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

export default Risks;
