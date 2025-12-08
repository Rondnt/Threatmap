const { Alert } = require('../models');
const { sendEmail } = require('../config/email');
const logger = require('../config/logger');
const { SEVERITY_LEVELS, ALERT_TYPES } = require('../utils/constants');

/**
 * Create a new alert
 * @param {Object} alertData - Alert data
 * @returns {Promise<Alert>} Created alert
 */
const createAlert = async (alertData) => {
  try {
    const alert = await Alert.create(alertData);

    // Send email for critical and high severity alerts
    if (
      (alert.severity === SEVERITY_LEVELS.CRITICAL || alert.severity === SEVERITY_LEVELS.HIGH) &&
      process.env.ALERT_CRITICAL_EMAIL === 'true'
    ) {
      await sendAlertEmail(alert);
      alert.email_sent = true;
      await alert.save();
    }

    // Emit socket event (will be handled by socket.io)
    global.io && global.io.emit('new_alert', alert);

    logger.info(`Alert created: ${alert.id} - ${alert.title}`);
    return alert;
  } catch (error) {
    logger.error(`Error creating alert: ${error.message}`);
    throw error;
  }
};

/**
 * Create threat alert
 * @param {Object} threat - Threat object
 */
const createThreatAlert = async (threat) => {
  if (threat.severity === SEVERITY_LEVELS.CRITICAL || threat.severity === SEVERITY_LEVELS.HIGH) {
    await createAlert({
      title: `New ${threat.severity} threat detected`,
      message: `Threat "${threat.name}" has been identified with ${threat.severity} severity`,
      type: ALERT_TYPES.THREAT,
      severity: threat.severity,
      related_entity_type: 'threat',
      related_entity_id: threat.id
    });
  }
};

/**
 * Create vulnerability alert
 * @param {Object} vulnerability - Vulnerability object
 */
const createVulnerabilityAlert = async (vulnerability) => {
  if (vulnerability.cvss_score >= 7.0) {
    const severity = vulnerability.cvss_score >= 9.0 ? SEVERITY_LEVELS.CRITICAL : SEVERITY_LEVELS.HIGH;

    await createAlert({
      title: `High-severity vulnerability detected`,
      message: `Vulnerability "${vulnerability.name}" with CVSS score ${vulnerability.cvss_score}`,
      type: ALERT_TYPES.VULNERABILITY,
      severity,
      related_entity_type: 'vulnerability',
      related_entity_id: vulnerability.id
    });
  }
};

/**
 * Create risk alert
 * @param {Object} risk - Risk object
 */
const createRiskAlert = async (risk) => {
  if (risk.risk_level === SEVERITY_LEVELS.CRITICAL || risk.risk_level === SEVERITY_LEVELS.HIGH) {
    await createAlert({
      title: `${risk.risk_level.charAt(0).toUpperCase() + risk.risk_level.slice(1)} risk identified`,
      message: `Risk "${risk.name}" with score ${risk.risk_score}`,
      type: ALERT_TYPES.RISK,
      severity: risk.risk_level,
      related_entity_type: 'risk',
      related_entity_id: risk.id
    });
  }
};

/**
 * Send alert email
 * @param {Alert} alert - Alert object
 */
const sendAlertEmail = async (alert) => {
  try {
    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .alert-box { padding: 20px; border-radius: 5px; margin: 20px; }
            .critical { background-color: #FEE2E2; border-left: 4px solid #DC2626; }
            .high { background-color: #FEF3C7; border-left: 4px solid #F59E0B; }
            .title { font-size: 18px; font-weight: bold; color: #1F2937; }
            .message { margin-top: 10px; color: #4B5563; }
            .footer { margin-top: 20px; font-size: 12px; color: #9CA3AF; }
          </style>
        </head>
        <body>
          <div class="alert-box ${alert.severity}">
            <div class="title">🚨 ThreatMap Alert - ${alert.severity.toUpperCase()}</div>
            <h2>${alert.title}</h2>
            <div class="message">${alert.message}</div>
            <div class="footer">
              <p>Alert Type: ${alert.type}</p>
              <p>Generated at: ${new Date().toLocaleString()}</p>
              <p>This is an automated alert from ThreatMap</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: `[ThreatMap] ${alert.severity.toUpperCase()} Alert: ${alert.title}`,
      html: emailHTML
    });

    logger.info(`Alert email sent for: ${alert.id}`);
  } catch (error) {
    logger.error(`Error sending alert email: ${error.message}`);
  }
};

/**
 * Get unread alerts
 * @param {Number} limit - Max number of alerts
 * @returns {Promise<Array>} Unread alerts
 */
const getUnreadAlerts = async (limit = 10) => {
  return await Alert.findAll({
    where: { is_read: false },
    order: [['created_at', 'DESC']],
    limit
  });
};

/**
 * Mark alert as read
 * @param {String} alertId - Alert ID
 * @param {String} userId - User ID
 */
const acknowledgeAlert = async (alertId, userId) => {
  const alert = await Alert.findByPk(alertId);

  if (!alert) {
    throw new Error('Alert not found');
  }

  alert.is_read = true;
  alert.status = 'acknowledged';
  alert.acknowledged_by = userId;
  alert.acknowledged_at = new Date();
  await alert.save();

  return alert;
};

/**
 * Get alert statistics
 * @returns {Promise<Object>} Alert statistics
 */
const getAlertStatistics = async () => {
  const [total, unread, critical, high] = await Promise.all([
    Alert.count(),
    Alert.count({ where: { is_read: false } }),
    Alert.count({ where: { severity: SEVERITY_LEVELS.CRITICAL } }),
    Alert.count({ where: { severity: SEVERITY_LEVELS.HIGH } })
  ]);

  return {
    total,
    unread,
    critical,
    high,
    read: total - unread
  };
};

module.exports = {
  createAlert,
  createThreatAlert,
  createVulnerabilityAlert,
  createRiskAlert,
  sendAlertEmail,
  getUnreadAlerts,
  acknowledgeAlert,
  getAlertStatistics
};
