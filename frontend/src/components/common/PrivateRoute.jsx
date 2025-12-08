import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('token');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  // Check both user state AND token in localStorage
  const isAuthenticated = user && token;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
