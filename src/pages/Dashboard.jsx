import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { customerApi, orderApi, supplierApi, dashboardApi } from '../services/api'; // Import from your API service

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentData, setRecentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Use your API services instead of direct fetch calls
        const [customersRes, ordersRes, suppliersRes] = await Promise.all([
          customerApi.getAll(),
          orderApi.getAll(),
          supplierApi.getAll()
        ]);

        const customers = customersRes.data || customersRes;
        const orders = ordersRes.data || ordersRes;
        const suppliers = suppliersRes.data || suppliersRes;

        setStats({
          customers: customers.length || 0,
          orders: orders.length || 0,
          pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'processing').length || 0,
          completedOrders: orders.filter(o => o.status === 'completed' || o.status === 'delivered').length || 0,
          suppliers: suppliers.length || 0,
          totalRevenue: orders.reduce((total, order) => total + (order.totalAmount || order.total || 0), 0)
        });

        setRecentData({
          customers: Array.isArray(customers) ? customers.slice(0, 5) : [],
          orders: Array.isArray(orders) ? orders.slice(0, 5) : [],
          suppliers: Array.isArray(suppliers) ? suppliers.slice(0, 5) : []
        });
        
      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 mb-4 text-lg">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name}</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-600">Total Customers</h3>
              <p className="text-3xl font-bold text-gray-800">{stats?.customers || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-600">Total Orders</h3>
              <p className="text-3xl font-bold text-gray-800">{stats?.orders || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-600">Pending Orders</h3>
              <p className="text-3xl font-bold text-gray-800">{stats?.pendingOrders || 0}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-600">Total Revenue</h3>
              <p className="text-3xl font-bold text-gray-800">
                {stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : '₦0'}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <span className="text-purple-600 font-bold text-xl">₦</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Customers */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Recent Customers</h3>
          <div className="space-y-3">
            {recentData?.customers?.length > 0 ? (
              recentData.customers.map(customer => (
                <div key={customer._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{customer.name}</p>
                    <p className="text-sm text-gray-500">{customer.phone || customer.email}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    New
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent customers</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Recent Orders</h3>
          <div className="space-y-3">
            {recentData?.orders?.length > 0 ? (
              recentData.orders.map(order => (
                <div key={order._id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-800">
                      Order #{order._id?.slice(-6) || 'N/A'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Total: {formatCurrency(order.totalAmount || order.total || 0)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            )}
          </div>
        </div>

        {/* Recent Suppliers */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Recent Suppliers</h3>
          <div className="space-y-3">
            {recentData?.suppliers?.length > 0 ? (
              recentData.suppliers.map(supplier => (
                <div key={supplier._id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-800">{supplier.name}</p>
                  <p className="text-sm text-gray-600">{supplier.contactPerson}</p>
                  <p className="text-sm text-gray-500">{supplier.email}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent suppliers</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;