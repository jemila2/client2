// components/AdminRoute.js
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  
  console.log('AdminRoute - User:', user);
  console.log('AdminRoute - isAdmin():', isAdmin());
  console.log('AdminRoute - User role:', user?.role);
  
  if (!user) {
    console.log('AdminRoute - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin()) {
    console.log('AdminRoute - Not an admin, redirecting to home');
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default AdminRoute;