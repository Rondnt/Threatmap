const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de SSL para conexiones en producción (Aiven)
const dialectOptions = process.env.DB_SSL === 'true' ? {
  ssl: {
    require: true,
    rejectUnauthorized: false // Aiven usa certificados autofirmados
  }
} : {};

const sequelize = new Sequelize(
  process.env.DB_NAME || 'threatmap_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectOptions,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true//Evita que Sequelize pluralice automáticamente los nombres de los modelos para nombrar las tablas.
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Database connected successfully');

    // Sincronizar modelos en desarrollo
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('Database models synchronized');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
