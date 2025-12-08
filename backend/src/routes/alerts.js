const express = require('express');
const router = express.Router();
const { Risk, Threat, Vulnerability, Alert } = require('../models');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get all critical alerts (critical risks, threats, and vulnerabilities)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query; // 'active', 'resolved', 'dismissed', 'all'
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Get critical and high severity items for this user only
    const [criticalRisks, criticalThreats, criticalVulns, alertStatuses] = await Promise.all([
      Risk.findAll({
        where: {
          risk_level: ['critical', 'high'],
          user_id: userId
        },
        order: [['createdAt', 'DESC']]
      }),
      Threat.findAll({
        where: {
          severity: ['critical', 'high'],
          status: 'active',
          user_id: userId
        },
        order: [['createdAt', 'DESC']]
      }),
      Vulnerability.findAll({
        where: {
          severity: ['critical', 'high'],
          status: ['open', 'in_progress'],
          user_id: userId
        },
        order: [['discovered_at', 'DESC']]
      }),
      Alert.findAll()
    ]);

    // Clean up "resolved" and "dismissed" alerts for entities that are critical/high again
    // This allows entities to re-alert if they become critical/high after being resolved/dismissed
    const currentEntityIds = new Set([
      ...criticalRisks.map(r => `risk-${r.id}`),
      ...criticalThreats.map(t => `threat-${t.id}`),
      ...criticalVulns.map(v => `vulnerability-${v.id}`)
    ]);

    // Delete resolved/dismissed alerts that correspond to current critical/high entities
    const alertsToDelete = alertStatuses.filter(alert => {
      const key = `${alert.related_entity_type}-${alert.related_entity_id}`;
      return currentEntityIds.has(key);
    });

    if (alertsToDelete.length > 0) {
      await Alert.destroy({
        where: {
          id: alertsToDelete.map(a => a.id)
        }
      });
      console.log(`[CLEANUP] Deleted ${alertsToDelete.length} resolved/dismissed alerts for entities that are critical/high again`);
    }

    // Create a map of alert statuses and read state for quick lookup
    const alertStatusMap = {};
    const alertReadMap = {};
    alertStatuses.forEach(alert => {
      const key = `${alert.related_entity_type}-${alert.related_entity_id}`;
      alertStatusMap[key] = alert.status;
      alertReadMap[key] = alert.is_read;
    });

    // Transform to unified alert format with alert status included
    const alerts = [
      ...criticalRisks.map(risk => {
        const alertId = `risk-${risk.id}`;
        return {
          id: alertId,
          type: 'risk',
          severity: risk.risk_level,
          name: risk.name,
          description: risk.description,
          createdAt: risk.createdAt,
          updatedAt: risk.updatedAt,
          alertStatus: alertStatusMap[alertId] || 'active',
          is_read: alertReadMap[alertId] || false,
          data: {
            probability: risk.probability,
            impact: risk.impact,
            risk_score: risk.risk_score
          }
        };
      }),
      ...criticalThreats.map(threat => {
        const alertId = `threat-${threat.id}`;
        return {
          id: alertId,
          type: 'threat',
          severity: threat.severity,
          name: threat.name,
          description: threat.description,
          createdAt: threat.createdAt,
          updatedAt: threat.updatedAt,
          alertStatus: alertStatusMap[alertId] || 'active',
          is_read: alertReadMap[alertId] || false,
          data: {
            type: threat.type,
            status: threat.status,
            source: threat.source
          }
        };
      }),
      ...criticalVulns.map(vuln => {
        const alertId = `vulnerability-${vuln.id}`;
        return {
          id: alertId,
          type: 'vulnerability',
          severity: vuln.severity,
          name: vuln.name,
          description: vuln.description,
          createdAt: vuln.createdAt,
          updatedAt: vuln.updatedAt,
          alertStatus: alertStatusMap[alertId] || 'active',
          is_read: alertReadMap[alertId] || false,
          data: {
            cve_id: vuln.cve_id,
            cvss_score: vuln.cvss_score,
            status: vuln.status
          }
        };
      })
    ];

    console.log('[GET /alerts] Status filter:', status);
    console.log('[GET /alerts] Alert status map:', alertStatusMap);
    console.log('[GET /alerts] Total alerts before filtering:', alerts.length);

    // Filter alerts based on their status
    const filteredAlerts = alerts.filter(alert => {
      if (status === 'active' || !status) {
        // Show only alerts that are not resolved or dismissed
        return alert.alertStatus === 'active';
      } else if (status === 'resolved') {
        return alert.alertStatus === 'resolved';
      } else if (status === 'dismissed') {
        return alert.alertStatus === 'dismissed';
      } else if (status === 'all') {
        return true;
      }
      return true;
    });

    console.log('[GET /alerts] Total alerts after filtering:', filteredAlerts.length);

    // Sort by creation date (most recent first)
    filteredAlerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: {
        alerts: filteredAlerts,
        total: filteredAlerts.length,
        critical: filteredAlerts.filter(a => a.severity === 'critical').length,
        high: filteredAlerts.filter(a => a.severity === 'high').length
      }
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener alertas',
      error: error.message
    });
  }
});

// Get alert statistics
router.get('/statistics', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Get all resolved/dismissed alerts
    const resolvedAlerts = await Alert.findAll({
      where: {
        status: ['resolved', 'dismissed']
      }
    });

    // Create a set of resolved alert IDs for quick lookup
    const resolvedAlertIds = new Set(
      resolvedAlerts.map(alert => `${alert.related_entity_type}-${alert.related_entity_id}`)
    );

    // Get all critical and high severity items for this user only
    const [criticalRisks, highRisks, criticalThreats, highThreats, criticalVulns, highVulns] = await Promise.all([
      Risk.findAll({ where: { risk_level: 'critical', user_id: userId } }),
      Risk.findAll({ where: { risk_level: 'high', user_id: userId } }),
      Threat.findAll({ where: { severity: 'critical', status: 'active', user_id: userId } }),
      Threat.findAll({ where: { severity: 'high', status: 'active', user_id: userId } }),
      Vulnerability.findAll({ where: { severity: 'critical', status: ['open', 'in_progress'], user_id: userId } }),
      Vulnerability.findAll({ where: { severity: 'high', status: ['open', 'in_progress'], user_id: userId } })
    ]);

    // Count only active alerts (not resolved or dismissed)
    const criticalRisksCount = criticalRisks.filter(r => !resolvedAlertIds.has(`risk-${r.id}`)).length;
    const highRisksCount = highRisks.filter(r => !resolvedAlertIds.has(`risk-${r.id}`)).length;
    const criticalThreatsCount = criticalThreats.filter(t => !resolvedAlertIds.has(`threat-${t.id}`)).length;
    const highThreatsCount = highThreats.filter(t => !resolvedAlertIds.has(`threat-${t.id}`)).length;
    const criticalVulnsCount = criticalVulns.filter(v => !resolvedAlertIds.has(`vulnerability-${v.id}`)).length;
    const highVulnsCount = highVulns.filter(v => !resolvedAlertIds.has(`vulnerability-${v.id}`)).length;

    res.json({
      success: true,
      data: {
        critical: {
          total: criticalRisksCount + criticalThreatsCount + criticalVulnsCount,
          risks: criticalRisksCount,
          threats: criticalThreatsCount,
          vulnerabilities: criticalVulnsCount
        },
        high: {
          total: highRisksCount + highThreatsCount + highVulnsCount,
          risks: highRisksCount,
          threats: highThreatsCount,
          vulnerabilities: highVulnsCount
        },
        totalAlerts: criticalRisksCount + highRisksCount + criticalThreatsCount + highThreatsCount + criticalVulnsCount + highVulnsCount
      }
    });
  } catch (error) {
    console.error('Error fetching alert statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de alertas',
      error: error.message
    });
  }
});

// Mark alert as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    // Split only on the first hyphen to handle UUIDs with hyphens
    const dashIndex = id.indexOf('-');
    const type = id.substring(0, dashIndex);
    const entityId = id.substring(dashIndex + 1);

    // Create or update alert record
    const [alert, created] = await Alert.findOrCreate({
      where: {
        related_entity_type: type,
        related_entity_id: entityId
      },
      defaults: {
        title: 'Alert',
        message: 'Alert marked as read',
        type: type,
        severity: 'info',
        is_read: true,
        related_entity_type: type,
        related_entity_id: entityId
      }
    });

    if (!created) {
      await alert.update({ is_read: true });
    }

    res.json({
      success: true,
      message: 'Alerta marcada como leída',
      data: alert
    });
  } catch (error) {
    console.error('Error marking alert as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar alerta como leída',
      error: error.message
    });
  }
});

// Mark alert as acknowledged
router.patch('/:id/acknowledge', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Split only on the first hyphen to handle UUIDs with hyphens
    const dashIndex = id.indexOf('-');
    const type = id.substring(0, dashIndex);
    const entityId = id.substring(dashIndex + 1);

    const [alert, created] = await Alert.findOrCreate({
      where: {
        related_entity_type: type,
        related_entity_id: entityId
      },
      defaults: {
        title: 'Alert',
        message: 'Alert acknowledged',
        type: type,
        severity: 'info',
        status: 'acknowledged',
        is_read: true,
        acknowledged_by: userId,
        acknowledged_at: new Date(),
        related_entity_type: type,
        related_entity_id: entityId
      }
    });

    if (!created) {
      await alert.update({
        status: 'acknowledged',
        is_read: true,
        acknowledged_by: userId,
        acknowledged_at: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Alerta reconocida',
      data: alert
    });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error al reconocer alerta',
      error: error.message
    });
  }
});

// Resolve alert
router.patch('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[RESOLVE] Received alert ID:', id);

    // Split only on the first hyphen to handle UUIDs with hyphens
    const dashIndex = id.indexOf('-');
    const type = id.substring(0, dashIndex);
    const entityId = id.substring(dashIndex + 1);

    console.log('[RESOLVE] Parsed type:', type);
    console.log('[RESOLVE] Parsed entityId:', entityId);

    // Create or update alert record
    const [alert, created] = await Alert.findOrCreate({
      where: {
        related_entity_type: type,
        related_entity_id: entityId
      },
      defaults: {
        title: 'Alert',
        message: 'Alert resolved',
        type: type,
        severity: 'info',
        status: 'resolved',
        is_read: true,
        resolved_at: new Date(),
        related_entity_type: type,
        related_entity_id: entityId
      }
    });

    console.log('[RESOLVE] Alert findOrCreate result - created:', created, 'alert ID:', alert.id);

    if (!created) {
      await alert.update({
        status: 'resolved',
        is_read: true,
        resolved_at: new Date()
      });
      console.log('[RESOLVE] Alert updated to resolved status');
    } else {
      console.log('[RESOLVE] New alert created with resolved status');
    }

    // Update the original entity status to reflect resolution
    if (type === 'risk') {
      console.log('[RESOLVE] Looking for risk with ID:', entityId);
      const risk = await Risk.findByPk(entityId);
      console.log('[RESOLVE] Risk found:', risk ? 'YES' : 'NO');
      if (risk) {
        console.log('[RESOLVE] Current risk level:', risk.risk_level);
        // Update probability, impact, and risk_score to result in low risk
        // Set probability to 0.1 and impact to 2, which gives risk_score = 2.0 (low)
        await risk.update({
          probability: 0.1,
          impact: 2,
          risk_score: 2.0,
          risk_level: 'low',
          status: 'closed'
        });
        console.log('[RESOLVE] Risk downgraded to low (score: 2.0)');
      } else {
        console.log('[RESOLVE] ERROR: Risk not found with ID:', entityId);
      }
    } else if (type === 'threat') {
      const threat = await Threat.findByPk(entityId);
      if (threat) {
        // Change threat status to mitigated
        await threat.update({ status: 'mitigated', mitigated_at: new Date() });
        console.log('[RESOLVE] Threat status changed to mitigated');
      }
    } else if (type === 'vulnerability') {
      const vulnerability = await Vulnerability.findByPk(entityId);
      if (vulnerability) {
        // Change vulnerability status to patched
        await vulnerability.update({ status: 'patched', patched_at: new Date() });
        console.log('[RESOLVE] Vulnerability status changed to patched');
      }
    }

    res.json({
      success: true,
      message: 'Alerta resuelta',
      data: alert
    });
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error al resolver alerta',
      error: error.message
    });
  }
});

// Dismiss alert
router.patch('/:id/dismiss', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[DISMISS] Received alert ID:', id);

    // Split only on the first hyphen to handle UUIDs with hyphens
    const dashIndex = id.indexOf('-');
    const type = id.substring(0, dashIndex);
    const entityId = id.substring(dashIndex + 1);

    console.log('[DISMISS] Parsed type:', type);
    console.log('[DISMISS] Parsed entityId:', entityId);

    // Create or update alert record
    const [alert, created] = await Alert.findOrCreate({
      where: {
        related_entity_type: type,
        related_entity_id: entityId
      },
      defaults: {
        title: 'Alert',
        message: 'Alert dismissed',
        type: type,
        severity: 'info',
        status: 'dismissed',
        is_read: true,
        related_entity_type: type,
        related_entity_id: entityId
      }
    });

    console.log('[DISMISS] Alert findOrCreate result - created:', created, 'alert ID:', alert.id);

    if (!created) {
      await alert.update({
        status: 'dismissed',
        is_read: true
      });
      console.log('[DISMISS] Alert updated to dismissed status');
    } else {
      console.log('[DISMISS] New alert created with dismissed status');
    }

    // Update the original entity status when dismissed
    // Dismissing means acknowledging but not fixing - downgrade severity
    if (type === 'risk') {
      const risk = await Risk.findByPk(entityId);
      if (risk) {
        // Downgrade risk level to medium when dismissed
        // Set probability to 0.5 and impact to 3, which gives risk_score = 15.0 = 1.5 (low)
        // Actually for medium we need score between 3-5, so let's use 0.4 * 10 = 4.0
        await risk.update({
          probability: 0.4,
          impact: 10,
          risk_score: 4.0,
          risk_level: 'medium',
          status: 'monitoring'
        });
        console.log('[DISMISS] Risk downgraded to medium (score: 4.0)');
      }
    } else if (type === 'threat') {
      const threat = await Threat.findByPk(entityId);
      if (threat) {
        // Change threat status to monitoring
        await threat.update({ status: 'monitoring' });
        console.log('[DISMISS] Threat status changed to monitoring');
      }
    } else if (type === 'vulnerability') {
      const vulnerability = await Vulnerability.findByPk(entityId);
      if (vulnerability) {
        // Change vulnerability status to accepted
        await vulnerability.update({ status: 'accepted' });
        console.log('[DISMISS] Vulnerability status changed to accepted');
      }
    }

    res.json({
      success: true,
      message: 'Alerta descartada',
      data: alert
    });
  } catch (error) {
    console.error('Error dismissing alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descartar alerta',
      error: error.message
    });
  }
});

module.exports = router;
