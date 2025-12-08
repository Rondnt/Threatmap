const axios = require('axios');

// INSTRUCTIONS:
// 1. Get your token from localStorage in the browser (F12 console): localStorage.getItem('token')
// 2. Replace YOUR_TOKEN_HERE below with your actual token
// 3. Run: node scripts/create-test-data.js

const API_URL = 'http://localhost:5000/api/v1';
const TOKEN = 'YOUR_TOKEN_HERE'; // Replace with your actual token

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`
  }
});

const threats = [
  {
    name: 'Ransomware en Servidor Producción',
    description: 'Se detectó actividad sospechosa de ransomware intentando cifrar archivos del servidor de producción',
    type: 'ransomware',
    severity: 'critical',
    probability: 0.9,
    impact: 10,
    source: 'Sistema de Monitoreo EDR'
  },
  {
    name: 'Campaña de Phishing Detectada',
    description: 'Múltiples correos de phishing dirigidos al personal de finanzas y contabilidad',
    type: 'phishing',
    severity: 'high',
    probability: 0.7,
    impact: 6,
    source: 'Email Security Gateway'
  },
  {
    name: 'Intento de SQL Injection',
    description: 'Intentos repetidos de inyección SQL en formulario de login de la aplicación web',
    type: 'sql_injection',
    severity: 'high',
    probability: 0.6,
    impact: 8,
    source: 'WAF Logs'
  },
  {
    name: 'Ataque DDoS Detectado',
    description: 'Tráfico anómalo indicando posible ataque de denegación de servicio',
    type: 'ddos',
    severity: 'medium',
    probability: 0.5,
    impact: 7,
    source: 'Cloudflare Analytics'
  },
  {
    name: 'Malware en Estación de Trabajo',
    description: 'Troyano detectado en equipo del departamento de marketing',
    type: 'malware',
    severity: 'medium',
    probability: 0.4,
    impact: 5,
    source: 'Antivirus Corporativo'
  }
];

const risks = [
  {
    name: 'Riesgo de Pérdida de Datos Críticos',
    description: 'Posibilidad de pérdida de datos de clientes por falta de respaldos adecuados',
    category: 'technical',
    probability: 0.8,
    impact: 10
  },
  {
    name: 'Fuga de Información Confidencial',
    description: 'Riesgo de exposición de información sensible por controles de acceso inadecuados',
    category: 'compliance',
    probability: 0.6,
    impact: 8
  },
  {
    name: 'Interrupción del Servicio',
    description: 'Posible caída de servicios principales por falta de redundancia',
    category: 'operational',
    probability: 0.5,
    impact: 6
  },
  {
    name: 'Incumplimiento de Normativas',
    description: 'Riesgo de no cumplir con GDPR y regulaciones de privacidad',
    category: 'compliance',
    probability: 0.4,
    impact: 7
  },
  {
    name: 'Pérdida Financiera por Fraude',
    description: 'Riesgo de pérdidas económicas por fraude electrónico',
    category: 'financial',
    probability: 0.3,
    impact: 9
  }
];

async function createTestData() {
  console.log('🚀 Iniciando creación de datos de prueba...\n');

  if (TOKEN === 'YOUR_TOKEN_HERE') {
    console.error('❌ ERROR: Debes reemplazar YOUR_TOKEN_HERE con tu token real');
    console.log('\nPara obtener tu token:');
    console.log('1. Abre http://localhost:3000 en el navegador');
    console.log('2. Presiona F12 para abrir la consola');
    console.log('3. Ejecuta: localStorage.getItem(\'token\')');
    console.log('4. Copia el token y reemplázalo en este archivo\n');
    process.exit(1);
  }

  try {
    // Crear amenazas
    console.log('📊 Creando amenazas...');
    for (const threat of threats) {
      try {
        const response = await api.post('/threats', threat);
        console.log(`✅ Amenaza creada: ${threat.name} (${threat.severity})`);
      } catch (error) {
        console.error(`❌ Error creando amenaza "${threat.name}":`, error.response?.data?.message || error.message);
      }
    }

    console.log('\n📊 Creando riesgos...');
    for (const risk of risks) {
      try {
        const response = await api.post('/risks', risk);
        console.log(`✅ Riesgo creado: ${risk.name} (Score: ${response.data.risk.risk_score})`);
      } catch (error) {
        console.error(`❌ Error creando riesgo "${risk.name}":`, error.response?.data?.message || error.message);
      }
    }

    console.log('\n✨ ¡Datos de prueba creados exitosamente!');
    console.log('\nAhora puedes ver los datos en:');
    console.log('- Dashboard: http://localhost:3000/dashboard');
    console.log('- Amenazas: http://localhost:3000/threats');
    console.log('- Riesgos: http://localhost:3000/risks');
    console.log('- Matriz: http://localhost:3000/risk-matrix');

  } catch (error) {
    console.error('\n❌ Error general:', error.message);
    if (error.response?.status === 401) {
      console.log('\n⚠️  Token inválido o expirado. Obtén un nuevo token siguiendo las instrucciones arriba.');
    }
  }
}

createTestData();
