import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EmployeeRoute = ({ children }) => {
  const { user } = useAuth();
  
  // Check if user has employee or admin role
  if (!['employee', 'admin'].includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default EmployeeRoute;