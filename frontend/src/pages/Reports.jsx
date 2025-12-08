import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { reportService } from '../services/reportService';
import { toast } from 'react-toastify';
import { FaFilePdf, FaDownload, FaTrash, FaPlus, FaSpinner, FaClock } from 'react-icons/fa';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await reportService.getAll();
      setReports(response.data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      await reportService.generate({
        title: 'Resumen Ejecutivo de Seguridad',
        type: 'executive_summary'
      });
      toast.success('Reporte generado exitosamente');
      loadReports();
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error al generar reporte');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (report) => {
    try {
      const response = await reportService.download(report.id);

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success('Reporte descargado');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Error al descargar reporte');
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('¿Estás seguro de eliminar este reporte?')) {
      return;
    }

    try {
      await reportService.delete(reportId);
      toast.success('Reporte eliminado');
      loadReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Error al eliminar reporte');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-100 text-green-800',
      generating: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    const labels = {
      completed: 'Completado',
      generating: 'Generando',
      failed: 'Fallido'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FaFilePdf className="text-red-500" />
              Reportes
            </h1>
            <p className="mt-2 text-gray-600">
              Genera y gestiona reportes de seguridad en PDF
            </p>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <FaSpinner className="animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <FaPlus />
                Generar Reporte
              </>
            )}
          </button>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Historial de Reportes</h2>

            {reports.length === 0 ? (
              <div className="text-center py-12">
                <FaFilePdf className="mx-auto text-6xl text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No hay reportes generados</p>
                <p className="text-gray-400 mt-2">Haz clic en "Generar Reporte" para crear uno nuevo</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map(report => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <FaFilePdf className="text-4xl text-red-500" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FaClock />
                            {formatDate(report.generated_at || report.created_at)}
                          </span>
                          <span>{formatFileSize(report.file_size)}</span>
                          <span>{getStatusBadge(report.status)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {report.status === 'completed' && (
                        <button
                          onClick={() => handleDownload(report)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Descargar reporte"
                        >
                          <FaDownload />
                          Descargar
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        title="Eliminar reporte"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Contenido del Reporte</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• Resumen ejecutivo del estado de seguridad</li>
            <li>• Estadísticas de amenazas, vulnerabilidades y riesgos</li>
            <li>• Lista detallada de elementos críticos</li>
            <li>• Recomendaciones de mitigación</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
