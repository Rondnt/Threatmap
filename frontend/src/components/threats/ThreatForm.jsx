import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const ThreatForm = ({ threat, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'malware',
    severity: 'medium',
    status: 'active',
    probability: 0.5,
    impact: 5,
    source: ''
  });

  useEffect(() => {
    if (threat) {
      setFormData({
        name: threat.name || '',
        description: threat.description || '',
        type: threat.type || 'malware',
        severity: threat.severity || 'medium',
        status: threat.status || 'active',
        probability: threat.probability || 0.5,
        impact: threat.impact || 5,
        source: threat.source || ''
      });
    }
  }, [threat]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'probability' || name === 'impact' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (formData.probability < 0 || formData.probability > 1) {
      toast.error('La probabilidad debe estar entre 0 y 1');
      return;
    }

    if (formData.impact < 1 || formData.impact > 10) {
      toast.error('El impacto debe estar entre 1 y 10');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la Amenaza *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Ransomware en Servidor Principal"
            required
          />
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe la amenaza detectada..."
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="malware">Malware</option>
            <option value="phishing">Phishing</option>
            <option value="ransomware">Ransomware</option>
            <option value="ddos">DDoS</option>
            <option value="sql_injection">SQL Injection</option>
            <option value="xss">Cross-Site Scripting (XSS)</option>
            <option value="mitm">Man in the Middle</option>
            <option value="insider_threat">Amenaza Interna</option>
            <option value="zero_day">Zero Day</option>
            <option value="brute_force">Fuerza Bruta</option>
            <option value="social_engineering">Ingeniería Social</option>
            <option value="other">Otro</option>
          </select>
        </div>

        {/* Severidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Severidad *
          </label>
          <select
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </select>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado *
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="active">Activa</option>
            <option value="monitoring">En Monitoreo</option>
            <option value="mitigated">Mitigada</option>
            <option value="closed">Cerrada</option>
          </select>
        </div>

        {/* Fuente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fuente
          </label>
          <input
            type="text"
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Sistema de Monitoreo, WAF, etc."
          />
        </div>

        {/* Probabilidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Probabilidad (0-1) *
          </label>
          <input
            type="number"
            name="probability"
            value={formData.probability}
            onChange={handleChange}
            step="0.1"
            min="0"
            max="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Actual: {formData.probability} ({(formData.probability * 100).toFixed(0)}%)
          </p>
        </div>

        {/* Impacto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Impacto (1-10) *
          </label>
          <input
            type="number"
            name="impact"
            value={formData.impact}
            onChange={handleChange}
            min="1"
            max="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Riesgo estimado: {(formData.probability * formData.impact * 10).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {threat ? 'Actualizar' : 'Crear'} Amenaza
        </button>
      </div>
    </form>
  );
};

export default ThreatForm;
