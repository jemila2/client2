// In CustomerRoute.js
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const CustomerRoute = ({ children }) => {
  const { user, isCustomer } = useAuth();
  
  console.log('CustomerRoute - User:', user);
  console.log('CustomerRoute - isCustomer():', isCustomer());
  console.log('CustomerRoute - User role:', user?.role);
  
  if (!user) {
    console.log('CustomerRoute - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  if (!isCustomer() && user.role !== 'customer') {
    console.log('CustomerRoute - Not a customer, redirecting to home');
    return <Navigate to="/" replace />;
  }
  
  return children;
};


export default CustomerRoute;