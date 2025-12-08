const { sequelize, connectDB } = require('./src/config/database');
const { Alert } = require('./src/models');

async function cleanAlerts() {
  try {
    await connectDB();
    console.log('Limpiando tabla de alertas...');

    await Alert.destroy({ where: {} });

    console.log('Tabla de alertas limpiada exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error('Error limpiando alertas:', error);
    process.exit(1);
  }
}

cleanAlerts();
