import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const RiskForm = ({ risk, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'technical',
    probability: 0.5,
    impact: 5,
    treatment_plan: '',
    owner: ''
  });

  useEffect(() => {
    if (risk) {
      setFormData({
        name: risk.name || '',
        description: risk.description || '',
        category: risk.category || 'technical',
        probability: risk.probability || 0.5,
        impact: risk.impact || 5,
        treatment_plan: risk.treatment_plan || '',
        owner: risk.owner || ''
      });
    }
  }, [risk]);

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

  // Calcular el score y nivel del riesgo
  const riskScore = (formData.probability * formData.impact * 10).toFixed(2);
  let riskLevel = 'low';
  // Umbrales más razonables: max score = 100 (1.0 × 10 × 10)
  if (riskScore >= 50) riskLevel = 'critical';      // Muy alta probabilidad Y alto impacto
  else if (riskScore >= 30) riskLevel = 'high';     // Alta probabilidad o alto impacto
  else if (riskScore >= 15) riskLevel = 'medium';   // Riesgo moderado

  const getLevelColor = (level) => {
    const colors = {
      critical: 'text-red-600',
      high: 'text-orange-600',
      medium: 'text-yellow-600',
      low: 'text-green-600'
    };
    return colors[level] || 'text-gray-600';
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Riesgo *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Riesgo de Pérdida de Datos Críticos"
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
            placeholder="Describe el riesgo identificado..."
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="operational">Operacional</option>
            <option value="technical">Técnico</option>
            <option value="compliance">Cumplimiento</option>
            <option value="financial">Financiero</option>
            <option value="reputational">Reputacional</option>
            <option value="strategic">Estratégico</option>
          </select>
        </div>

        {/* Responsable */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Responsable
          </label>
          <input
            type="text"
            name="owner"
            value={formData.owner}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nombre del responsable"
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
        </div>

        {/* Calculadora de Riesgo */}
        <div className="md:col-span-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Evaluación del Riesgo</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Score de Riesgo</p>
              <p className="text-2xl font-bold text-gray-900">{riskScore}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Nivel de Riesgo</p>
              <p className={`text-2xl font-bold ${getLevelColor(riskLevel)}`}>
                {getLevelText(riskLevel)}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Fórmula: Probabilidad × Impacto × 10 = {formData.probability} × {formData.impact} × 10 = {riskScore}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Niveles: Bajo (&lt;15) | Medio (15-29) | Alto (30-49) | Crítico (≥50)
          </p>
        </div>

        {/* Plan de Tratamiento */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plan de Tratamiento
          </label>
          <textarea
            name="treatment_plan"
            value={formData.treatment_plan}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe las acciones para tratar este riesgo..."
          />
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
          {risk ? 'Actualizar' : 'Crear'} Riesgo
        </button>
      </div>
    </form>
  );
};

export default RiskForm;
