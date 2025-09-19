import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import EmployeeRequestForm from '../components/EmployeeRequestForm';
import { 
  FiPlusCircle, 
  FiUser, 
  FiCreditCard, 
  FiHelpCircle,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiShoppingBag,
  FiRefreshCw,
  FiList
} from 'react-icons/fi';
import CustomerSidebar from '../components/CustomerSidebar';
import { orderApi } from '../services/api';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    orders: {
      total: 0,
      pending: 0,
      completed: 0,
      recent: []
    },
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Function to format Naira amount without decimals
  const formatNaira = (amount) => {
    return `₦${amount?.toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }) || '0'}`;
  };

  // Get customer's full name
  const getCustomerName = () => {
    if (!user) return 'Customer';
    
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || 'Customer';
  };

  const fetchDashboardData = async () => {
    if (!user || !user._id) return;
    
    try {
      setRefreshing(true);
      setError(null);
      
      console.log('Fetching customer orders for user ID:', user._id);
      
      // Fetch customer orders
      const ordersResponse = await orderApi.getCustomerOrders(user._id);
      console.log('Orders API response:', ordersResponse);
      
      let ordersData = [];
      
      // Handle different response structures
      if (Array.isArray(ordersResponse)) {
        ordersData = ordersResponse;
      } else if (ordersResponse && Array.isArray(ordersResponse.data)) {
        ordersData = ordersResponse.data;
      } else if (ordersResponse && Array.isArray(ordersResponse.orders)) {
        ordersData = ordersResponse.orders;
      } else if (ordersResponse && ordersResponse.success && Array.isArray(ordersResponse.data)) {
        ordersData = ordersResponse.data;
      }
      
      console.log('Processed orders data:', ordersData);
      
      // Calculate dashboard statistics
      const totalOrders = ordersData.length;
      const pendingOrders = ordersData.filter(order => 
        order.status && ['pending', 'processing', 'in-progress'].includes(order.status.toLowerCase())
      ).length;
      
      const completedOrders = ordersData.filter(order => 
        order.status && ['completed', 'delivered'].includes(order.status.toLowerCase())
      ).length;
      
      const totalSpent = ordersData
        .filter(order => order.status && ['completed', 'delivered'].includes(order.status.toLowerCase()))
        .reduce((sum, order) => sum + (order.total || 0), 0);
      
      // Get recent orders (last 5)
      const recentOrders = ordersData
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 5)
        .map(order => ({
          id: order._id || order.id,
          number: order.orderNumber || order._id || 'N/A',
          status: order.status || 'unknown',
          date: order.createdAt || order.date || new Date(),
          total: order.total || 0
        }));
      
      // Update dashboard data
      setDashboardData({
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          completed: completedOrders,
          recent: recentOrders
        },
        totalSpent: totalSpent
      });
      
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && user._id) {
      fetchDashboardData();
    }
    
    // Set up auto-refresh every 2 minutes
    const intervalId = setInterval(() => {
      if (user && user._id) {
        fetchDashboardData();
      }
    }, 120000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex">
      <CustomerSidebar />
      
      <div className="ml-35 p-6 w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Welcome back, {getCustomerName()}!
          </h1>
          
          <div className="flex items-center">
            {lastUpdated && (
              <span className="text-sm text-gray-500 mr-3">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
            >
              <FiRefreshCw className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-center">
              <FiAlertCircle className="text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : dashboardData.orders.total}
                </p>
              </div>
              <FiList className="text-purple-500 text-2xl" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Pending Orders</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : dashboardData.orders.pending}
                </p>
              </div>
              <FiClock className="text-yellow-500 text-2xl" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Completed Orders</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : dashboardData.orders.completed}
                </p>
              </div>
              <FiCheckCircle className="text-green-500 text-2xl" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : formatNaira(dashboardData.totalSpent)}
                </p>
              </div>
              <FiCreditCard className="text-blue-500 text-2xl" />
            </div>
          </div>
        </div>

        {/* Employee Request Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Become an Employee</h2>
          <p className="text-gray-600 mb-4">
            Interested in working with us? Submit a request to become an employee.
          </p>
          
          {!showRequestForm ? (
            <button
              onClick={() => setShowRequestForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Request Employee Status
            </button>
          ) : (
            <EmployeeRequestForm />
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/customer/orders/new"
                className="flex items-center p-3 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
              >
                <FiPlusCircle className="mr-2" />
                New Order
              </Link>
              <Link
                to="/customer/orders"
                className="flex items-center p-3 bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors"
              >
                <FiShoppingBag className="mr-2" />
                View All Orders
              </Link>
              <Link
                to="/customer/payment-history"
                className="flex items-center p-3 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
              >
                <FiCreditCard className="mr-2" />
                Payment History
              </Link>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <FiClock className="animate-spin text-gray-400 text-2xl" />
              </div>
            ) : dashboardData.orders.recent.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.orders.recent.map(order => (
                  <Link
                    key={order.id}
                    to={`/customer/orders/${order.id}`}
                    className="block p-3 border rounded hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Order #{order.number}</span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        order.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : order.status === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1 text-sm text-gray-500">
                      <span>{new Date(order.date).toLocaleDateString()}</span>
                      <span>{formatNaira(order.total)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            )}
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
          <Link
            to="/customer/support"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <FiHelpCircle className="mr-2" />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;