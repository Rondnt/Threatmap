import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import Modal from '../components/common/Modal';
import { riskService } from '../services/riskService';
import { toast } from 'react-toastify';
import { FaShieldAlt, FaInfoCircle, FaChartBar, FaExclamationTriangle } from 'react-icons/fa';

const RiskMatrix = () => {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState(null);

  useEffect(() => {
    loadRisks();
  }, []);

  const loadRisks = async () => {
    try {
      const response = await riskService.getAll();
      const risksData = response.data?.data?.risks || response.data?.risks || [];
      console.log('Risks loaded:', risksData);
      console.log('Sample risk:', risksData[0]);
      setRisks(risksData);
    } catch (error) {
      console.error('Error loading risks:', error);
      toast.error('Error al cargar riesgos');
    } finally {
      setLoading(false);
    }
  };

  // Calculate risk level based on actual risk score (0-100)
  const calculateRiskLevel = (riskScore) => {
    const score = parseFloat(riskScore) || 0;

    // Using the same thresholds as backend: Critical ≥50, High ≥30, Medium ≥15
    if (score >= 50) return 'critical';
    if (score >= 30) return 'high';
    if (score >= 15) return 'medium';
    return 'low';
  };

  // Get color for risk level
  const getRiskColor = (level) => {
    switch (level) {
      case 'critical': return 'bg-red-600 text-white border-red-700';
      case 'high': return 'bg-orange-500 text-white border-orange-600';
      case 'medium': return 'bg-yellow-400 text-gray-900 border-yellow-500';
      case 'low': return 'bg-green-500 text-white border-green-600';
      default: return 'bg-gray-200 text-gray-700 border-gray-300';
    }
  };

  // Convert probability from decimal (0.0-1.0) to scale 1-5 for matrix visualization only
  const convertProbabilityToScale = (prob) => {
    const probFloat = parseFloat(prob) || 0;
    if (probFloat === 0) return 1;
    if (probFloat <= 0.2) return 1;
    if (probFloat <= 0.4) return 2;
    if (probFloat <= 0.6) return 3;
    if (probFloat <= 0.8) return 4;
    return 5;
  };

  // Convert impact from scale 1-10 to scale 1-5 for matrix visualization only
  const convertImpactToScale = (imp) => {
    const impInt = parseInt(imp) || 1;
    if (impInt <= 2) return 1;
    if (impInt <= 4) return 2;
    if (impInt <= 6) return 3;
    if (impInt <= 8) return 4;
    return 5;
  };

  // Get risks for a specific cell in the matrix
  const getRisksInCell = (probability, impact) => {
    return risks.filter(risk => {
      const riskProb = convertProbabilityToScale(risk.probability);
      const riskImpact = convertImpactToScale(risk.impact);
      return riskProb === probability && riskImpact === impact;
    });
  };

  // Handle cell click
  const handleCellClick = (probability, impact) => {
    const cellRisks = getRisksInCell(probability, impact);
    if (cellRisks.length > 0) {
      setSelectedCell({ probability, impact, risks: cellRisks });
      setIsModalOpen(true);
    }
  };

  // Handle risk detail view
  const handleRiskClick = (risk) => {
    setSelectedRisk(risk);
  };

  // Calculate statistics
  const statistics = {
    critical: risks.filter(r => r.risk_level === 'critical').length,
    high: risks.filter(r => r.risk_level === 'high').length,
    medium: risks.filter(r => r.risk_level === 'medium').length,
    low: risks.filter(r => r.risk_level === 'low').length,
    total: risks.length
  };

  // Get highest risk level in a cell
  const getHighestRiskLevelInCell = (cellRisks) => {
    if (cellRisks.length === 0) return null;

    // Priority order: critical > high > medium > low
    const priorities = { critical: 4, high: 3, medium: 2, low: 1 };

    let highestLevel = 'low';
    let highestPriority = 0;

    cellRisks.forEach(risk => {
      const priority = priorities[risk.risk_level] || 0;
      if (priority > highestPriority) {
        highestPriority = priority;
        highestLevel = risk.risk_level;
      }
    });

    return highestLevel;
  };

  // Render matrix cell
  const renderCell = (probability, impact) => {
    const cellRisks = getRisksInCell(probability, impact);
    const hasRisks = cellRisks.length > 0;

    // If there are risks in this cell, use the highest risk_score to determine color
    // This uses the actual 0-100 scoring system instead of matrix position
    let riskLevel = 'low';
    if (hasRisks) {
      const maxRiskScore = Math.max(...cellRisks.map(r => parseFloat(r.risk_score) || 0));
      riskLevel = calculateRiskLevel(maxRiskScore);
    } else {
      // For empty cells, calculate based on theoretical score for that position
      const theoreticalScore = (probability / 5) * (impact * 2) * 10; // Convert to 0-100 scale
      riskLevel = calculateRiskLevel(theoreticalScore);
    }
    const colorClass = getRiskColor(riskLevel);

    // Debug logging for first render
    if (probability === 5 && impact === 5) {
      console.log(`Cell (5,5): score=${probability*impact}, level=${riskLevel}, color=${colorClass}`);
    }
    if (probability === 3 && impact === 4) {
      console.log(`Cell (3,4): score=${probability*impact}, level=${riskLevel}, color=${colorClass}`);
    }
    if (probability === 2 && impact === 2) {
      console.log(`Cell (2,2): score=${probability*impact}, level=${riskLevel}, color=${colorClass}`);
    }

    return (
      <div
        key={`${probability}-${impact}`}
        onClick={() => hasRisks && handleCellClick(probability, impact)}
        className={`
          ${colorClass}
          border-2 p-4 rounded-lg flex flex-col items-center justify-center
          min-h-[100px] transition-all duration-200
          ${hasRisks ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : 'cursor-default opacity-50'}
        `}
      >
        {hasRisks && (
          <>
            <div className="text-3xl font-bold">{cellRisks.length}</div>
            <div className="text-xs mt-1 font-semibold">
              {cellRisks.length === 1 ? 'Riesgo' : 'Riesgos'}
            </div>
          </>
        )}
      </div>
    );
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
            <FaShieldAlt className="mr-3 text-blue-600" />
            Matriz de Riesgos
          </h1>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Total Riesgos</p>
            <p className="text-4xl font-bold text-gray-900">{statistics.total}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-6 text-center border-l-4 border-red-600">
            <p className="text-sm text-gray-600 mb-2">Críticos</p>
            <p className="text-4xl font-bold text-red-600">{statistics.critical}</p>
          </div>
          <div className="bg-orange-50 rounded-lg shadow p-6 text-center border-l-4 border-orange-600">
            <p className="text-sm text-gray-600 mb-2">Altos</p>
            <p className="text-4xl font-bold text-orange-600">{statistics.high}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-6 text-center border-l-4 border-yellow-600">
            <p className="text-sm text-gray-600 mb-2">Medios</p>
            <p className="text-4xl font-bold text-yellow-600">{statistics.medium}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-6 text-center border-l-4 border-green-600">
            <p className="text-sm text-gray-600 mb-2">Bajos</p>
            <p className="text-4xl font-bold text-green-600">{statistics.low}</p>
          </div>
        </div>

        {/* Matrix */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Matriz 5x5 de Probabilidad vs Impacto</h2>
            <p className="text-gray-600 flex items-center">
              <FaInfoCircle className="mr-2" />
              Haz clic en una celda para ver los riesgos en esa categoría
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Matrix Container */}
              <div className="flex">
                {/* Y-axis label (Impact) */}
                <div className="flex flex-col items-center justify-center mr-4">
                  <div className="transform -rotate-90 whitespace-nowrap">
                    <span className="text-lg font-bold text-gray-700">IMPACTO</span>
                  </div>
                </div>

                {/* Matrix Grid */}
                <div className="flex-1">
                  {/* Y-axis values */}
                  <div className="flex">
                    <div className="flex flex-col justify-around mr-2 py-2">
                      {[5, 4, 3, 2, 1].map(impact => (
                        <div key={impact} className="h-[100px] flex items-center justify-center">
                          <span className="text-lg font-semibold text-gray-700">{impact}</span>
                        </div>
                      ))}
                    </div>

                    {/* Matrix cells */}
                    <div className="flex-1">
                      <div className="grid grid-rows-5 gap-2">
                        {[5, 4, 3, 2, 1].map(impact => (
                          <div key={impact} className="grid grid-cols-5 gap-2">
                            {[1, 2, 3, 4, 5].map(probability =>
                              renderCell(probability, impact)
                            )}
                          </div>
                        ))}
                      </div>

                      {/* X-axis values */}
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map(prob => (
                          <div key={prob} className="text-center">
                            <span className="text-lg font-semibold text-gray-700">{prob}</span>
                          </div>
                        ))}
                      </div>

                      {/* X-axis label */}
                      <div className="text-center mt-4">
                        <span className="text-lg font-bold text-gray-700">PROBABILIDAD</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaChartBar className="mr-2" />
              Leyenda de Niveles de Riesgo
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-600 rounded mr-3"></div>
                <div>
                  <p className="font-semibold text-gray-900">Crítico</p>
                  <p className="text-xs text-gray-600">Score ≥ 50</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-orange-500 rounded mr-3"></div>
                <div>
                  <p className="font-semibold text-gray-900">Alto</p>
                  <p className="text-xs text-gray-600">Score 30-49</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-400 rounded mr-3"></div>
                <div>
                  <p className="font-semibold text-gray-900">Medio</p>
                  <p className="text-xs text-gray-600">Score 15-29</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded mr-3"></div>
                <div>
                  <p className="font-semibold text-gray-900">Bajo</p>
                  <p className="text-xs text-gray-600">Score &lt; 15</p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-700">
                <strong>Cálculo del Score:</strong> Probabilidad (0-1) × Impacto (1-10) × 10 = Score (0-100)
              </p>
              <p className="text-xs text-gray-500 mt-2 italic">
                Los colores de las celdas se basan en el score real de los riesgos que contienen.
              </p>
            </div>
          </div>
        </div>

        {/* Top Risks */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <FaExclamationTriangle className="mr-2 text-orange-600" />
            Riesgos Prioritarios
          </h2>
          <div className="space-y-3">
            {risks
              .sort((a, b) => {
                const scoreA = parseFloat(a.risk_score) || 0;
                const scoreB = parseFloat(b.risk_score) || 0;
                return scoreB - scoreA;
              })
              .slice(0, 10)
              .map((risk, index) => {
                const riskScore = parseFloat(risk.risk_score) || 0;
                return (
                  <div
                    key={risk.id || index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleRiskClick(risk)}
                  >
                    <div className="flex items-center flex-1">
                      <div className="mr-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          risk.risk_level === 'critical' ? 'bg-red-600' :
                          risk.risk_level === 'high' ? 'bg-orange-500' :
                          risk.risk_level === 'medium' ? 'bg-yellow-400 text-gray-900' :
                          'bg-green-500'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{risk.name}</p>
                        <p className="text-sm text-gray-600">{risk.description || 'Sin descripción'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Probabilidad</p>
                        <p className="text-lg font-bold text-gray-900">{(parseFloat(risk.probability) * 100).toFixed(0)}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Impacto</p>
                        <p className="text-lg font-bold text-gray-900">{risk.impact}/10</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Score</p>
                        <p className="text-2xl font-bold text-blue-600">{riskScore.toFixed(2)}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        risk.risk_level === 'critical' ? 'bg-red-100 text-red-800' :
                        risk.risk_level === 'high' ? 'bg-orange-100 text-orange-800' :
                        risk.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {risk.risk_level === 'critical' ? 'Crítico' :
                         risk.risk_level === 'high' ? 'Alto' :
                         risk.risk_level === 'medium' ? 'Medio' : 'Bajo'}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Modal for cell risks */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCell(null);
        }}
        title={selectedCell ? `Riesgos (Probabilidad: ${selectedCell.probability}, Impacto: ${selectedCell.impact})` : ''}
      >
        {selectedCell && (
          <div className="space-y-3">
            {selectedCell.risks.map((risk, index) => {
              const riskScore = parseFloat(risk.risk_score) || 0;

              return (
                <div key={risk.id || index} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">{risk.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{risk.description || 'Sin descripción'}</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-white p-2 rounded">
                      <span className="text-gray-500 block">Probabilidad:</span>
                      <span className="font-bold text-lg">{(parseFloat(risk.probability) * 100).toFixed(0)}%</span>
                      <span className="text-xs text-gray-500 block">({parseFloat(risk.probability).toFixed(2)})</span>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <span className="text-gray-500 block">Impacto:</span>
                      <span className="font-bold text-lg">{risk.impact}/10</span>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <span className="text-gray-500 block">Score:</span>
                      <span className="font-bold text-blue-600 text-lg">{riskScore.toFixed(2)}</span>
                      <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                        risk.risk_level === 'critical' ? 'bg-red-100 text-red-800' :
                        risk.risk_level === 'high' ? 'bg-orange-100 text-orange-800' :
                        risk.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {risk.risk_level === 'critical' ? 'Crítico' :
                         risk.risk_level === 'high' ? 'Alto' :
                         risk.risk_level === 'medium' ? 'Medio' : 'Bajo'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default RiskMatrix;
