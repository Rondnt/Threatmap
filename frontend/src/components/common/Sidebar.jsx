import { Link, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaExclamationTriangle,
  FaBug,
  FaShieldAlt,
  FaChartArea,
  FaServer,
  FaNetworkWired,
  FaBell,
  FaFilePdf
} from 'react-icons/fa';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/alerts', icon: FaBell, label: 'Alertas' },
    { path: '/threats', icon: FaExclamationTriangle, label: 'Amenazas' },
    { path: '/vulnerabilities', icon: FaBug, label: 'Vulnerabilidades' },
    { path: '/risks', icon: FaShieldAlt, label: 'Riesgos' },
    { path: '/risk-matrix', icon: FaChartArea, label: 'Matriz de Riesgos' },
    { path: '/attack-surface', icon: FaNetworkWired, label: 'Superficie de Ataque' },
    { path: '/reports', icon: FaFilePdf, label: 'Reportes' }
  ];

  if (!isOpen) return null;

  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-gray-900 text-white shadow-lg">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
