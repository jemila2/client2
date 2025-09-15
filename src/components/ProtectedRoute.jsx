import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  console.log('ProtectedRoute - User:', user, 'Loading:', loading);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    console.log('ProtectedRoute - Redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// In AdminRoute.js
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  
  console.log('AdminRoute - User role:', user?.role);
  
  if (user?.role !== 'admin') {
    console.log('AdminRoute - Access denied, not admin');
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRoute;