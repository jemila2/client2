// components/DashboardLayout.js - Minimal version
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { user } = useAuth();

  console.log('DashboardLayout MINIMAL - User:', user);
  console.log('DashboardLayout MINIMAL - Component rendered');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 bg-red-100">
        <h1 className="text-xl font-bold">Dashboard Layout</h1>
        <p>User: {user?.name}</p>
      </div>
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;