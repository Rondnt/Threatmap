import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Threats from './pages/Threats';
import Risks from './pages/Risks';
import RiskMatrix from './pages/RiskMatrix';
import Vulnerabilities from './pages/Vulnerabilities';
import AttackSurface from './pages/AttackSurface';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Private routes */}
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/threats" element={<PrivateRoute><Threats /></PrivateRoute>} />
            <Route path="/vulnerabilities" element={<PrivateRoute><Vulnerabilities /></PrivateRoute>} />
            <Route path="/risks" element={<PrivateRoute><Risks /></PrivateRoute>} />
            <Route path="/risk-matrix" element={<PrivateRoute><RiskMatrix /></PrivateRoute>} />
            <Route path="/attack-surface" element={<PrivateRoute><AttackSurface /></PrivateRoute>} />
            <Route path="/alerts" element={<PrivateRoute><Alerts /></PrivateRoute>} />
            <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />

            {/* Redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
