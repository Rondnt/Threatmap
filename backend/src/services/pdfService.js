const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { Report } = require('../models');
const logger = require('../config/logger');

/**
 * Generate PDF report
 * @param {Object} reportData - Report data
 * @param {String} userId - User ID
 * @returns {Promise<Report>} Generated report
 */
const generatePDFReport = async (reportData, userId) => {
  try {
    // Create report record
    const report = await Report.create({
      title: reportData.title,
      type: reportData.type,
      format: 'pdf',
      status: 'generating',
      filters: reportData.filters || {},
      date_from: reportData.dateFrom,
      date_to: reportData.dateTo,
      user_id: userId
    });

    // Generate PDF
    const filePath = await createPDF(report, reportData);

    // Update report
    const stats = fs.statSync(filePath);
    report.file_path = filePath;
    report.file_size = stats.size;
    report.status = 'completed';
    report.generated_at = new Date();
    await report.save();

    logger.info(`PDF report generated: ${report.id}`);
    return report;
  } catch (error) {
    logger.error(`Error generating PDF: ${error.message}`);
    throw error;
  }
};

/**
 * Create PDF file
 * @param {Report} report - Report object
 * @param {Object} data - Report data
 * @returns {Promise<String>} File path
 */
const createPDF = (report, data) => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure storage directory exists
      const storageDir = path.join(__dirname, '../../storage/reports');
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }

      const fileName = `report_${report.id}_${Date.now()}.pdf`;
      const filePath = path.join(storageDir, fileName);

      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header
      doc
        .fontSize(24)
        .text('ThreatMap Report', { align: 'center' })
        .moveDown();

      doc
        .fontSize(18)
        .text(report.title, { align: 'center' })
        .moveDown();

      // Report info
      doc
        .fontSize(10)
        .text(`Report Type: ${report.type.replace(/_/g, ' ').toUpperCase()}`)
        .text(`Generated: ${new Date().toLocaleString()}`)
        .text(`Period: ${report.date_from ? new Date(report.date_from).toLocaleDateString() : 'N/A'} - ${report.date_to ? new Date(report.date_to).toLocaleDateString() : 'N/A'}`)
        .moveDown(2);

      // Line separator
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown();

      // Executive Summary
      doc
        .fontSize(16)
        .text('Executive Summary', { underline: true })
        .moveDown();

      if (data.summary) {
        doc.fontSize(11).text(data.summary).moveDown();
      }

      // Statistics Section
      if (data.statistics) {
        doc
          .fontSize(16)
          .text('Key Statistics', { underline: true })
          .moveDown();

        Object.entries(data.statistics).forEach(([key, value]) => {
          doc
            .fontSize(11)
            .text(`${key.replace(/_/g, ' ').toUpperCase()}: ${value}`)
            .moveDown(0.5);
        });

        doc.moveDown();
      }

      // Threats Section
      if (data.threats && data.threats.length > 0) {
        doc
          .addPage()
          .fontSize(16)
          .text('Threats Analysis', { underline: true })
          .moveDown();

        data.threats.forEach((threat, index) => {
          doc
            .fontSize(12)
            .text(`${index + 1}. ${threat.name}`, { bold: true })
            .fontSize(10)
            .text(`Severity: ${threat.severity.toUpperCase()}`)
            .text(`Type: ${threat.type}`)
            .text(`Risk Score: ${threat.risk_score || 'N/A'}`)
            .text(`Status: ${threat.status}`)
            .moveDown();

          if (index < data.threats.length - 1 && doc.y > 650) {
            doc.addPage();
          }
        });
      }

      // Risks Section
      if (data.risks && data.risks.length > 0) {
        doc
          .addPage()
          .fontSize(16)
          .text('Risk Assessment', { underline: true })
          .moveDown();

        data.risks.forEach((risk, index) => {
          doc
            .fontSize(12)
            .text(`${index + 1}. ${risk.name}`, { bold: true })
            .fontSize(10)
            .text(`Risk Level: ${risk.risk_level.toUpperCase()}`)
            .text(`Score: ${risk.risk_score}`)
            .text(`Probability: ${risk.probability}`)
            .text(`Impact: ${risk.impact}`)
            .text(`Category: ${risk.category}`)
            .moveDown();

          if (index < data.risks.length - 1 && doc.y > 650) {
            doc.addPage();
          }
        });
      }

      // Vulnerabilities Section
      if (data.vulnerabilities && data.vulnerabilities.length > 0) {
        doc
          .addPage()
          .fontSize(16)
          .text('Vulnerabilities', { underline: true })
          .moveDown();

        data.vulnerabilities.forEach((vuln, index) => {
          doc
            .fontSize(12)
            .text(`${index + 1}. ${vuln.name}`, { bold: true })
            .fontSize(10)
            .text(`CVE: ${vuln.cve_id || 'N/A'}`)
            .text(`CVSS Score: ${vuln.cvss_score || 'N/A'}`)
            .text(`Severity: ${vuln.severity.toUpperCase()}`)
            .text(`Status: ${vuln.status}`)
            .moveDown();

          if (index < data.vulnerabilities.length - 1 && doc.y > 650) {
            doc.addPage();
          }
        });
      }

      // Footer
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(8)
          .text(
            `Page ${i + 1} of ${pages.count}`,
            50,
            doc.page.height - 50,
            { align: 'center' }
          );
      }

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Delete old reports
 * @param {Number} daysOld - Delete reports older than this many days
 */
const cleanupOldReports = async (daysOld = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldReports = await Report.findAll({
      where: {
        created_at: { [require('sequelize').Op.lt]: cutoffDate }
      }
    });

    for (const report of oldReports) {
      // Delete file
      if (report.file_path && fs.existsSync(report.file_path)) {
        fs.unlinkSync(report.file_path);
      }

      // Delete record
      await report.destroy();
    }

    logger.info(`Cleaned up ${oldReports.length} old reports`);
  } catch (error) {
    logger.error(`Error cleaning up old reports: ${error.message}`);
  }
};

module.exports = {
  generatePDFReport,
  cleanupOldReports
};
