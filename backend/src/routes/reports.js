const express = require('express');
const router = express.Router();
const { Report, Risk, Threat, Vulnerability } = require('../models');
const pdfGenerator = require('../services/pdfGenerator');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get all reports for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const reports = await Report.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reportes',
      error: error.message
    });
  }
});

// Generate a new report
router.post('/generate', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { title, type, filters } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Create report record
    const report = await Report.create({
      title: title || 'Resumen Ejecutivo de Seguridad',
      type: type || 'executive_summary',
      format: 'pdf',
      status: 'generating',
      filters: filters || {},
      user_id: userId
    });

    // Gather ALL data for comprehensive report
    const [threats, vulnerabilities, risks] = await Promise.all([
      Threat.findAll({
        where: { user_id: userId },
        order: [['severity', 'DESC'], ['created_at', 'DESC']]
      }),
      Vulnerability.findAll({
        where: { user_id: userId },
        order: [['severity', 'DESC'], ['discovered_at', 'DESC']]
      }),
      Risk.findAll({
        where: { user_id: userId },
        order: [['risk_score', 'DESC'], ['created_at', 'DESC']]
      })
    ]);

    // Calculate comprehensive statistics
    const statistics = {
      threats: {
        total: threats.length,
        critical: threats.filter(t => t.severity === 'critical').length,
        high: threats.filter(t => t.severity === 'high').length,
        medium: threats.filter(t => t.severity === 'medium').length,
        low: threats.filter(t => t.severity === 'low').length
      },
      vulnerabilities: {
        total: vulnerabilities.length,
        critical: vulnerabilities.filter(v => v.severity === 'critical').length,
        high: vulnerabilities.filter(v => v.severity === 'high').length,
        medium: vulnerabilities.filter(v => v.severity === 'medium').length,
        low: vulnerabilities.filter(v => v.severity === 'low').length
      },
      risks: {
        total: risks.length,
        critical: risks.filter(r => r.risk_level === 'critical').length,
        high: risks.filter(r => r.risk_level === 'high').length,
        medium: risks.filter(r => r.risk_level === 'medium').length,
        low: risks.filter(r => r.risk_level === 'low').length
      }
    };

    const reportData = {
      threats: threats.map(t => t.toJSON()),
      vulnerabilities: vulnerabilities.map(v => v.toJSON()),
      risks: risks.map(r => r.toJSON()),
      statistics,
      generatedAt: new Date()
    };

    // Generate PDF
    const pdfResult = await pdfGenerator.generateExecutiveSummary(reportData);

    // Update report with file info
    await report.update({
      status: 'completed',
      file_path: pdfResult.filepath,
      file_size: pdfResult.size,
      generated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Reporte generado exitosamente',
      data: report
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte',
      error: error.message
    });
  }
});

// Download a report
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const report = await Report.findOne({
      where: { id, user_id: userId }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    if (report.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'El reporte aún no está disponible'
      });
    }

    if (!fs.existsSync(report.file_path)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo de reporte no encontrado'
      });
    }

    res.download(report.file_path, path.basename(report.file_path));
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar reporte',
      error: error.message
    });
  }
});

// Delete a report
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const report = await Report.findOne({
      where: { id, user_id: userId }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    // Delete file if exists
    if (report.file_path && fs.existsSync(report.file_path)) {
      fs.unlinkSync(report.file_path);
    }

    await report.destroy();

    res.json({
      success: true,
      message: 'Reporte eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar reporte',
      error: error.message
    });
  }
});

module.exports = router;
