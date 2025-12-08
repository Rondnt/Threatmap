import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaUser, FaSignOutAlt, FaBell } from 'react-icons/fa';
import { alertService } from '../../services/alertService';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    loadAlertCount();
    // Refresh alert count every 30 seconds
    const interval = setInterval(loadAlertCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAlertCount = async () => {
    try {
      const response = await alertService.getStatistics();
      const total = response.data?.critical?.total || 0;
      setAlertCount(total);
    } catch (error) {
      console.error('Error loading alert count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <FaBars className="h-6 w-6" />
            </button>
            <h1 className="ml-4 text-2xl font-bold text-gray-900">
              ThreatMap
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Alert Bell */}
            <button
              onClick={() => navigate('/alerts')}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
              title="Alertas Críticas"
            >
              <FaBell className="h-6 w-6" />
              {alertCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {alertCount > 99 ? '99+' : alertCount}
                </span>
              )}
            </button>

            <div className="flex items-center text-sm text-gray-700">
              <FaUser className="mr-2" />
              <span className="font-medium">{user?.username}</span>
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                {user?.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition"
            >
              <FaSignOutAlt className="mr-2" />
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
