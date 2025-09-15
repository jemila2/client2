

import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import EmployeeRoute from './components/EmployeeRoute';
import SupplierRoute from './components/SupplierRoute';
import CustomerRoute from './components/CustomerRoute';
import DashboardLayout from './components/DashboardLayout';
import SupplierLayout from './components/SupplierLayout';
import CustomerLayout from './components/CustomerLayout';
import NotFound from './pages/NotFound';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import AdminDashboard from './pages/AdminDashboard';
import Employees from './pages/Employees';
import EmployeeForm from './pages/EmployeeForm';
import EmployeeProfile from './pages/EmployeeProfile';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import SupplierForm from './pages/SupplierForm';
import SupplierDetail from './pages/SupplierDetail';
import PurchaseOrders from './pages/PurchaseOrders';
import CreatePurchaseOrder from './pages/CreatePurchaseOrder';
import PurchaseOrderDetail from './pages/PurchaseOrderDetail';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import AdminSettings from './pages/AdminSettings';

// Employee Pages
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeOrders from './pages/EmployeeOrders';
import NewOrderPage from './pages/NewOrderPage';
import OrderDetailPage from './pages/OrderDetailPage';
import Schedule from './pages/Schedule';
import EmployeeTasks from './components/EmployeeTasks';
import EmployeeReports from './pages/EmployeeReports';
import EmployeeMessages from './pages/EmployeeMessages';
import ManageOrders from './pages/ManageOrders';

// Supplier Pages
import SupplierDashboard from './pages/SupplierDashboard';
import SupplierOrders from './pages/SupplierOrders';
import SupplierInventory from './pages/SupplierInventory';
import SupplierPayments from './pages/SupplierPayments';
import SupplierSettings from './pages/SupplierSettings';

// Customer Pages
import CustomerDashboard from './pages/CustomerDashboard';
import PaymentHistory from './pages/PaymentHistory';
import Support from './pages/Support';
import CustomerForm from './pages/CustomerForm';
import CustomerDetails from './pages/CustomerDetails';
import CustomerNewOrder from './pages/CustomerNewOrder';
import CustomerOrders from './pages/CustomerOrders';

// Import AdminRegistrationForm and React hooks
import { useState, useEffect } from 'react';
import AdminRegistrationForm from './components/AdminRegistrationForm';

// Admin Setup Check Component - SIMPLIFIED VERSION
const AdminSetupCheck = ({ children }) => {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setChecking(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Admin setup route */}
          <Route path="/setup-admin" element={
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
              <AdminRegistrationForm />
            </div>
          } />

          {/* Protected routes - FIXED NESTED ROUTING */}
          
          {/* Admin routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminSetupCheck>
                  <DashboardLayout>
                    <Routes>
                      <Route index element={<AdminDashboard />} />
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="employees" element={<Employees />} />
                      <Route path="employees/add" element={<EmployeeForm />} />
                      <Route path="employees/edit/:id" element={<EmployeeForm />} />
                      <Route path="employees/:id" element={<EmployeeProfile adminView />} />
                      <Route path="customers" element={<Customers />} />
                      <Route path="suppliers" element={<Suppliers />} />
                      <Route path="suppliers/add" element={<SupplierForm />} />
                      <Route path="suppliers/:id" element={<SupplierDetail />} />
                      <Route path="suppliers/edit/:id" element={<SupplierForm />} />
                      <Route path="orders" element={<EmployeeOrders adminView />} />
                      <Route path="orders/new" element={<NewOrderPage adminView />} />
                      <Route path="orders/:orderId" element={<OrderDetailPage adminView />} />
                      <Route path="purchase-orders" element={<PurchaseOrders />} />
                      <Route path="purchase-orders/new" element={<CreatePurchaseOrder />} />
                      <Route path="purchase-orders/:orderId" element={<PurchaseOrderDetail />} />
                      <Route path="inventory" element={<Inventory />} />
                      <Route path="invoices" element={<Invoices />} />
                      <Route path="payments" element={<Payments />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </DashboardLayout>
                </AdminSetupCheck>
              </AdminRoute>
            </ProtectedRoute>
          } />

          {/* Employee routes */}
          <Route path="/employee/*" element={
            <ProtectedRoute>
              <EmployeeRoute>
                <DashboardLayout>
                  <Routes>
                    <Route index element={<EmployeeDashboard />} />
                    <Route path="dashboard" element={<EmployeeDashboard />} />
                    <Route path="profile/:id" element={<EmployeeProfile />} />
                    <Route path="orders" element={<EmployeeOrders />} />
                    <Route path="orders/new" element={<NewOrderPage />} />
                    <Route path="orders/:orderId" element={<OrderDetailPage />} />
                    <Route path="manage-orders" element={<ManageOrders />} />
                    <Route path="customers" element={<Customers employeeView />} />
                    <Route path="customers/add" element={<CustomerForm />} />
                    <Route path="customers/edit/:id" element={<CustomerForm />} />
                    <Route path="customers/:id" element={<CustomerDetails />} />
                    <Route path="schedule" element={<Schedule />} />
                    <Route path="tasks" element={<EmployeeTasks />} />
                    <Route path="reports" element={<EmployeeReports />} />
                    <Route path="messages" element={<EmployeeMessages />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </EmployeeRoute>
            </ProtectedRoute>
          } />

          {/* Supplier routes */}
          <Route path="/supplier/*" element={
            <ProtectedRoute>
              <SupplierRoute>
                <SupplierLayout>
                  <Routes>
                    <Route index element={<SupplierDashboard />} />
                    <Route path="dashboard" element={<SupplierDashboard />} />
                    <Route path="orders" element={<SupplierOrders />} />
                    <Route path="orders/:orderId" element={<PurchaseOrderDetail external />} />
                    <Route path="inventory" element={<SupplierInventory />} />
                    <Route path="payments" element={<SupplierPayments />} />
                    <Route path="settings" element={<SupplierSettings />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </SupplierLayout>
              </SupplierRoute>
            </ProtectedRoute>
          } />

          {/* Customer routes */}
          <Route path="/customer/*" element={
            <ProtectedRoute>
              <CustomerRoute>
                <CustomerLayout>
                  <Routes>
                    <Route index element={<CustomerDashboard />} />
                    <Route path="dashboard" element={<CustomerDashboard />} />
                    <Route path="orders" element={<CustomerOrders />} />
                    <Route path="orders/new" element={<CustomerNewOrder />} />
                    <Route path="orders/:orderId" element={<OrderDetailPage customerView />} />
                    <Route path="payment-history" element={<PaymentHistory />} />
                    <Route path="support" element={<Support />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </CustomerLayout>
              </CustomerRoute>
            </ProtectedRoute>
          } />

          {/* Common protected routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* 404 route - MUST BE LAST */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;