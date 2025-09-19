import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../services/api'; // Use the specific API
import { toast } from 'react-toastify';
import EmployeeSidebar from '../components/EmployeeSidebar';

const CustomerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use orderApi directly instead of apiService
      const response = await orderApi.getAll();
      
      console.log('Orders API response:', response);
      
      // Handle different response structures
      let ordersData = [];
      
      if (Array.isArray(response)) {
        ordersData = response; // Direct array
      } else if (response && Array.isArray(response.data)) {
        ordersData = response.data; // { data: [] } format
      } else if (response && Array.isArray(response.orders)) {
        ordersData = response.orders; // { orders: [] } format
      } else if (response && response.success && Array.isArray(response.data)) {
        ordersData = response.data; // { success: true, data: [] } format
      }
      
      console.log('Processed orders:', ordersData);
      setOrders(ordersData);
      
      if (ordersData.length === 0) {
        toast.info('No orders found');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'employee') {
      fetchOrders();
    }
  }, [user]);

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.orderNumber?.toString().includes(searchTerm) ||
      (order.customer?.name && order.customer.name.toLowerCase().includes(searchLower)) ||
      (order.status && order.status.toLowerCase().includes(searchLower))
    );
  });

  if (user?.role !== 'employee') {
    return (
      <div className="flex">
        <EmployeeSidebar />
        <div className="p-4 text-red-500 ml-54">Access denied. Employees only.</div>
      </div>
    );
  }

  return (
    <div className="flex">
      <EmployeeSidebar />
      
      <div className="ml-54 p-6 w-full">
        <h1 className="text-2xl font-bold mb-6">Manage Orders</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">All Orders ({filteredOrders.length})</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search orders..."
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                onClick={fetchOrders}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 p-4 bg-red-50 rounded-lg">
              <p className="font-semibold">Error loading orders</p>
              <p>{error}</p>
              <button 
                onClick={fetchOrders}
                className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Try Again
              </button>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order._id || order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{order.orderNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{order.customer?.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${order.total ? order.total.toFixed(2) : '0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-4 text-gray-500">
              {orders.length === 0 ? 'No orders available' : 'No orders match your search'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerOrders;