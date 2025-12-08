const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

class PDFGenerator {
  constructor() {
    // Ensure reports directory exists
    this.reportsDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }

    // Chart configuration
    this.chartJSNodeCanvas = new ChartJSNodeCanvas({
      width: 500,
      height: 300,
      backgroundColour: 'white'
    });
  }

  async generateExecutiveSummary(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const filename = `executive_summary_${Date.now()}.pdf`;
        const filepath = path.join(this.reportsDir, filename);
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        // Header
        this.addHeader(doc, 'Informe de Análisis de Riesgos de Seguridad');

        // 1. Executive Summary Section
        doc.fontSize(16).text('Resumen Ejecutivo', { underline: true });
        doc.moveDown();

        // Statistics Overview
        doc.fontSize(12).text('Panorama General de Seguridad', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);

        // Statistics table
        const stats = [
          ['Categoría', 'Total', 'Críticos', 'Altos', 'Medios', 'Bajos'],
          [
            'Amenazas',
            data.statistics.threats.total.toString(),
            data.statistics.threats.critical.toString(),
            data.statistics.threats.high.toString(),
            (data.statistics.threats.medium || 0).toString(),
            (data.statistics.threats.low || 0).toString()
          ],
          [
            'Vulnerabilidades',
            data.statistics.vulnerabilities.total.toString(),
            data.statistics.vulnerabilities.critical.toString(),
            data.statistics.vulnerabilities.high.toString(),
            (data.statistics.vulnerabilities.medium || 0).toString(),
            (data.statistics.vulnerabilities.low || 0).toString()
          ],
          [
            'Riesgos',
            data.statistics.risks.total.toString(),
            data.statistics.risks.critical.toString(),
            data.statistics.risks.high.toString(),
            (data.statistics.risks.medium || 0).toString(),
            (data.statistics.risks.low || 0).toString()
          ]
        ];

        this.drawTable(doc, stats, {
          x: 50,
          y: doc.y,
          columnWidths: [120, 60, 60, 60, 60, 60]
        });

        doc.moveDown(2);

        // 2. Charts and Visualizations
        doc.addPage();
        doc.fontSize(16).text('Visualizaciones y Gráficos', { underline: true });
        doc.moveDown();

        // Generate and add charts
        await this.addDistributionCharts(doc, data);

        // 3. Threats Section
        if (data.threats && data.threats.length > 0) {
          doc.addPage();
          doc.fontSize(14).text('Amenazas Detectadas', { underline: true });
          doc.moveDown();
          doc.fontSize(10).text(`Total de amenazas: ${data.threats.length}`);
          doc.moveDown();

          data.threats.forEach((threat, index) => {
            if (doc.y > 700) doc.addPage();
            if (index > 0) doc.moveDown();

            const color = this.getSeverityColor(threat.severity);
            doc.fontSize(11).fillColor(color).text(`${index + 1}. ${threat.name}`, { underline: true });
            doc.fillColor('black').fontSize(9);
            doc.text(`Severidad: ${threat.severity.toUpperCase()} | Tipo: ${threat.type} | Estado: ${threat.status}`);
            doc.text(`Descripción: ${threat.description || 'N/A'}`);
            if (threat.mitigation_strategy) {
              doc.text(`Mitigación: ${threat.mitigation_strategy}`);
            }
          });
        }

        // 4. Vulnerabilities Section
        if (data.vulnerabilities && data.vulnerabilities.length > 0) {
          doc.addPage();
          doc.fontSize(14).text('Vulnerabilidades Identificadas', { underline: true });
          doc.moveDown();
          doc.fontSize(10).text(`Total de vulnerabilidades: ${data.vulnerabilities.length}`);
          doc.moveDown();

          data.vulnerabilities.forEach((vuln, index) => {
            if (doc.y > 700) doc.addPage();
            if (index > 0) doc.moveDown();

            const color = this.getSeverityColor(vuln.severity);
            doc.fontSize(11).fillColor(color).text(`${index + 1}. ${vuln.name}`, { underline: true });
            doc.fillColor('black').fontSize(9);
            doc.text(`Severidad: ${vuln.severity.toUpperCase()} | CVE: ${vuln.cve_id || 'N/A'} | CVSS: ${vuln.cvss_score || 'N/A'}`);
            doc.text(`Estado: ${vuln.status}`);
            doc.text(`Descripción: ${vuln.description || 'N/A'}`);
            doc.text(`Sistemas Afectados: ${vuln.affected_systems || 'N/A'}`);
          });
        }

        // 5. Risks Section
        if (data.risks && data.risks.length > 0) {
          doc.addPage();
          doc.fontSize(14).text('Análisis de Riesgos', { underline: true });
          doc.moveDown();
          doc.fontSize(10).text(`Total de riesgos: ${data.risks.length}`);
          doc.moveDown();

          data.risks.forEach((risk, index) => {
            if (doc.y > 700) doc.addPage();
            if (index > 0) doc.moveDown();

            const color = this.getRiskLevelColor(risk.risk_level);
            doc.fontSize(11).fillColor(color).text(`${index + 1}. ${risk.name}`, { underline: true });
            doc.fillColor('black').fontSize(9);
            doc.text(`Nivel: ${risk.risk_level.toUpperCase()} | Puntuación: ${risk.risk_score} | Probabilidad: ${risk.probability} | Impacto: ${risk.impact}`);
            doc.text(`Estado: ${risk.status || 'N/A'}`);
            doc.text(`Descripción: ${risk.description || 'N/A'}`);
            if (risk.treatment_strategy) {
              doc.text(`Estrategia de Tratamiento: ${risk.treatment_strategy}`);
            }
          });
        }

        // 6. Recommendations
        doc.addPage();
        doc.fontSize(14).text('Recomendaciones de Seguridad', { underline: true });
        doc.moveDown();
        doc.fontSize(10);

        const recommendations = this.generateRecommendations(data);
        recommendations.forEach((rec, index) => {
          doc.text(`${index + 1}. ${rec}`);
          doc.moveDown(0.5);
        });

        // Footer
        this.addFooter(doc, data.generatedAt);

        doc.end();

        stream.on('finish', () => {
          const stats = fs.statSync(filepath);
          resolve({
            filepath: filepath,
            filename: filename,
            size: stats.size
          });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  async addDistributionCharts(doc, data) {
    try {
      // Threats distribution chart
      const threatsChart = await this.generateSeverityChart(
        'Distribución de Amenazas por Severidad',
        data.statistics.threats
      );
      doc.fontSize(12).text('Distribución de Amenazas por Severidad', { underline: true });
      doc.moveDown(0.5);
      doc.image(threatsChart, 50, doc.y, { width: 500 });
      doc.moveDown(20);

      // Vulnerabilities distribution chart
      if (doc.y > 500) doc.addPage();
      const vulnsChart = await this.generateSeverityChart(
        'Distribución de Vulnerabilidades por Severidad',
        data.statistics.vulnerabilities
      );
      doc.fontSize(12).text('Distribución de Vulnerabilidades por Severidad', { underline: true });
      doc.moveDown(0.5);
      doc.image(vulnsChart, 50, doc.y, { width: 500 });
      doc.moveDown(20);

      // Risks distribution chart
      if (doc.y > 500) doc.addPage();
      const risksChart = await this.generateRiskLevelChart(
        'Distribución de Riesgos por Nivel',
        data.statistics.risks
      );
      doc.fontSize(12).text('Distribución de Riesgos por Nivel', { underline: true });
      doc.moveDown(0.5);
      doc.image(risksChart, 50, doc.y, { width: 500 });
      doc.moveDown(2);

    } catch (error) {
      console.error('Error generating charts:', error);
      doc.fontSize(10).fillColor('red').text('Error al generar gráficos de visualización');
      doc.fillColor('black');
    }
  }

  async generateSeverityChart(title, stats) {
    const configuration = {
      type: 'bar',
      data: {
        labels: ['Críticos', 'Altos', 'Medios', 'Bajos'],
        datasets: [{
          label: 'Cantidad',
          data: [
            stats.critical || 0,
            stats.high || 0,
            stats.medium || 0,
            stats.low || 0
          ],
          backgroundColor: [
            'rgba(220, 38, 38, 0.8)',   // Critical - Red
            'rgba(234, 88, 12, 0.8)',   // High - Orange
            'rgba(245, 158, 11, 0.8)',  // Medium - Yellow
            'rgba(34, 197, 94, 0.8)'    // Low - Green
          ],
          borderColor: [
            'rgb(220, 38, 38)',
            'rgb(234, 88, 12)',
            'rgb(245, 158, 11)',
            'rgb(34, 197, 94)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    };

    return await this.chartJSNodeCanvas.renderToBuffer(configuration);
  }

  async generateRiskLevelChart(title, stats) {
    const configuration = {
      type: 'doughnut',
      data: {
        labels: ['Críticos', 'Altos', 'Medios', 'Bajos'],
        datasets: [{
          data: [
            stats.critical || 0,
            stats.high || 0,
            stats.medium || 0,
            stats.low || 0
          ],
          backgroundColor: [
            'rgba(220, 38, 38, 0.8)',
            'rgba(234, 88, 12, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(34, 197, 94, 0.8)'
          ],
          borderColor: [
            'rgb(220, 38, 38)',
            'rgb(234, 88, 12)',
            'rgb(245, 158, 11)',
            'rgb(34, 197, 94)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    };

    return await this.chartJSNodeCanvas.renderToBuffer(configuration);
  }

  drawTable(doc, data, options) {
    const { x, y, columnWidths } = options;
    let currentY = y;

    data.forEach((row, rowIndex) => {
      let currentX = x;

      row.forEach((cell, cellIndex) => {
        const width = columnWidths[cellIndex];

        // Header row
        if (rowIndex === 0) {
          doc.fontSize(9).fillColor('#1E40AF').text(cell, currentX, currentY, {
            width: width,
            align: 'center'
          });
        } else {
          doc.fontSize(9).fillColor('black').text(cell, currentX, currentY, {
            width: width,
            align: 'center'
          });
        }

        currentX += width;
      });

      currentY += 20;

      // Draw horizontal line after header
      if (rowIndex === 0) {
        doc.strokeColor('#1E40AF').lineWidth(1)
          .moveTo(x, currentY - 5)
          .lineTo(x + columnWidths.reduce((a, b) => a + b, 0), currentY - 5)
          .stroke();
      }
    });

    doc.y = currentY + 10;
  }

  generateRecommendations(data) {
    const recommendations = [];

    // Critical items recommendations
    if (data.statistics.threats.critical > 0) {
      recommendations.push('Priorizar la mitigación inmediata de amenazas críticas identificadas.');
    }

    if (data.statistics.vulnerabilities.critical > 0) {
      recommendations.push('Aplicar parches de seguridad para vulnerabilidades críticas de forma urgente.');
    }

    if (data.statistics.risks.critical > 0) {
      recommendations.push('Implementar planes de tratamiento para riesgos críticos sin demora.');
    }

    // High volume recommendations
    if (data.statistics.threats.total > 10) {
      recommendations.push('Realizar una revisión exhaustiva del sistema de detección y respuesta a amenazas.');
    }

    if (data.statistics.vulnerabilities.total > 10) {
      recommendations.push('Establecer un programa regular de escaneo y gestión de vulnerabilidades.');
    }

    if (data.statistics.risks.total > 15) {
      recommendations.push('Revisar y actualizar el marco de gestión de riesgos de la organización.');
    }

    // Severity distribution recommendations
    const highSeverityCount = (data.statistics.threats.critical || 0) +
                             (data.statistics.threats.high || 0) +
                             (data.statistics.vulnerabilities.critical || 0) +
                             (data.statistics.vulnerabilities.high || 0);

    if (highSeverityCount > 5) {
      recommendations.push('Considerar la contratación de servicios de seguridad externos para evaluación y remediación.');
    }

    // General recommendations
    recommendations.push('Mantener actualizados todos los sistemas, aplicaciones y dependencias.');
    recommendations.push('Implementar un programa de capacitación continua en seguridad para el personal.');
    recommendations.push('Revisar y actualizar las políticas de seguridad de forma trimestral.');
    recommendations.push('Realizar pruebas de penetración y auditorías de seguridad periódicas.');
    recommendations.push('Establecer un plan de respuesta a incidentes actualizado y probado.');

    return recommendations;
  }

  getSeverityColor(severity) {
    const colors = {
      critical: '#DC2626',
      high: '#EA580C',
      medium: '#F59E0B',
      low: '#22C55E'
    };
    return colors[severity] || '#000000';
  }

  getRiskLevelColor(riskLevel) {
    const colors = {
      critical: '#DC2626',
      high: '#EA580C',
      medium: '#F59E0B',
      low: '#22C55E'
    };
    return colors[riskLevel] || '#000000';
  }

  addHeader(doc, title) {
    doc.fontSize(20).fillColor('#1E40AF').text(title, { align: 'center' });
    doc.moveDown();
    doc.strokeColor('#1E40AF').lineWidth(2).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(2);
    doc.fillColor('black');
  }

  addFooter(doc, generatedAt) {
    const bottomY = doc.page.height - 50;
    doc.fontSize(8).fillColor('gray');
    doc.text(
      `Generado el ${new Date(generatedAt).toLocaleString('es-ES')}`,
      50,
      bottomY,
      { align: 'center' }
    );
    doc.text('ThreatMap - Sistema de Gestión de Amenazas y Riesgos', 50, bottomY + 10, { align: 'center' });
  }
}

module.exports = new PDFGenerator();
