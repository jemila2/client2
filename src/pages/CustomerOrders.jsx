// import { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { orderApi } from '../services/api';
// import { toast } from 'react-toastify';
// import EmployeeSidebar from '../components/EmployeeSidebar';
// import { FiSearch, FiRefreshCw, FiEye, FiCalendar, FiUser, FiDollarSign } from 'react-icons/fi';

// const CustomerOrders = () => {
//   const { user } = useAuth();
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await orderApi.getAll();
      
//       console.log('Orders API response:', response);
      
//       let ordersData = [];
      
//       if (Array.isArray(response)) {
//         ordersData = response;
//       } else if (response && Array.isArray(response.data)) {
//         ordersData = response.data;
//       } else if (response && Array.isArray(response.orders)) {
//         ordersData = response.orders;
//       } else if (response && response.success && Array.isArray(response.data)) {
//         ordersData = response.data;
//       }
      
//       console.log('Processed orders:', ordersData);
//       setOrders(ordersData);
      
//       if (ordersData.length === 0) {
//         toast.info('No orders found');
//       }
//     } catch (err) {
//       console.error('Error fetching orders:', err);
//       setError(err.message || 'Failed to load orders');
//       toast.error('Failed to load orders');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (user?.role === 'employee') {
//       fetchOrders();
//     }
//   }, [user]);

//   const filteredOrders = orders.filter(order => {
//     const searchLower = searchTerm.toLowerCase();
//     return (
//       order.orderNumber?.toString().includes(searchTerm) ||
//       (order.customer?.name && order.customer.name.toLowerCase().includes(searchLower)) ||
//       (order.status && order.status.toLowerCase().includes(searchLower))
//     );
//   });

//   const formatCurrency = (amount) => {
//     return `$${amount ? parseFloat(amount).toFixed(2) : '0.00'}`;
//   };

//   const getStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'completed':
//         return 'bg-green-100 text-green-800';
//       case 'processing':
//       case 'in progress':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'pending':
//         return 'bg-blue-100 text-blue-800';
//       case 'cancelled':
//         return 'bg-red-100 text-red-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   if (user?.role !== 'employee') {
//     return (
//       <div className="flex min-h-screen bg-gray-50">
//         <EmployeeSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
//         <div className="flex-1 p-4 md:ml-0">
//           <div className="text-red-500 bg-white p-4 rounded-lg shadow">
//             Access denied. Employees only.
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       {/* Sidebar */}
//       <EmployeeSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
//       {/* Main Content */}
//       <div className="flex-1 lg:ml-64">
//         {/* Mobile Header */}
//         <div className="bg-white shadow-sm border-b lg:hidden">
//           <div className="flex items-center justify-between p-4">
//             <button
//               onClick={() => setIsSidebarOpen(true)}
//               className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
//             >
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//               </svg>
//             </button>
//             <h1 className="text-xl font-bold text-gray-800">Manage Orders</h1>
//             <div className="w-6"></div> {/* Spacer for balance */}
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-4 lg:p-6">
//           {/* Header Section */}
//           <div className="mb-6 lg:flex lg:items-center lg:justify-between">
//             <div className="mb-4 lg:mb-0">
//               <h1 className="text-2xl font-bold text-gray-900 hidden lg:block">Manage Orders</h1>
//               <p className="text-gray-600 mt-1">Total orders: {filteredOrders.length}</p>
//             </div>
            
//             {/* Search and Actions */}
//             <div className="flex flex-col sm:flex-row gap-3">
//               {/* Search Input */}
//               <div className="relative flex-1 min-w-0">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <FiSearch className="text-gray-400" />
//                 </div>
//                 <input
//                   type="text"
//                   placeholder="Search orders..."
//                   className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
              
//               {/* Refresh Button */}
//               <button 
//                 onClick={fetchOrders}
//                 disabled={loading}
//                 className="inline-flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               >
//                 <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
//                 <span className="hidden sm:inline">Refresh</span>
//               </button>
//             </div>
//           </div>

//           {/* Orders Container */}
//           <div className="bg-white rounded-lg shadow">
//             {loading ? (
//               <div className="flex justify-center items-center h-64">
//                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//               </div>
//             ) : error ? (
//               <div className="p-6 text-center">
//                 <div className="text-red-500 bg-red-50 p-4 rounded-lg">
//                   <p className="font-semibold">Error loading orders</p>
//                   <p className="mt-1">{error}</p>
//                   <button 
//                     onClick={fetchOrders}
//                     className="mt-3 bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 transition-colors"
//                   >
//                     Try Again
//                   </button>
//                 </div>
//               </div>
//             ) : filteredOrders.length > 0 ? (
//               <>
//                 {/* Desktop Table */}
//                 <div className="hidden lg:block overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Order #
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Customer
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Status
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Date
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Total
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {filteredOrders.map((order) => (
//                         <tr key={order._id || order.id} className="hover:bg-gray-50 transition-colors">
//                           <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
//                             {order.orderNumber}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-gray-700">
//                             {order.customer?.name || 'N/A'}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
//                               {order.status}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-gray-500">
//                             {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
//                             {formatCurrency(order.total)}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Mobile Cards */}
//                 <div className="lg:hidden">
//                   <div className="p-4 space-y-4">
//                     {filteredOrders.map((order) => (
//                       <div key={order._id || order.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
//                         {/* Order Header */}
//                         <div className="flex justify-between items-start mb-3">
//                           <div>
//                             <h3 className="font-semibold text-gray-900">Order #{order.orderNumber}</h3>
//                             <p className="text-sm text-gray-500 mt-1">
//                               {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
//                             </p>
//                           </div>
//                           <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
//                             {order.status}
//                           </span>
//                         </div>

//                         {/* Order Details */}
//                         <div className="space-y-2">
//                           <div className="flex items-center text-sm text-gray-600">
//                             <FiUser className="mr-2 text-gray-400" />
//                             <span>{order.customer?.name || 'N/A'}</span>
//                           </div>
                          
//                           <div className="flex items-center text-sm text-gray-600">
//                             <FiDollarSign className="mr-2 text-gray-400" />
//                             <span className="font-medium">{formatCurrency(order.total)}</span>
//                           </div>
//                         </div>

//                         {/* Actions */}
//                         <div className="mt-4 pt-3 border-t border-gray-100">
//                           <button className="w-full inline-flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors">
//                             <FiEye className="mr-2" />
//                             View Details
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </>
//             ) : (
//               <div className="p-8 text-center">
//                 <div className="text-gray-500">
//                   <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                   </svg>
//                   <h3 className="mt-2 text-sm font-medium text-gray-900">
//                     {orders.length === 0 ? 'No orders available' : 'No orders match your search'}
//                   </h3>
//                   <p className="mt-1 text-sm text-gray-500">
//                     {orders.length === 0 ? 'Get started by creating a new order.' : 'Try adjusting your search terms.'}
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CustomerOrders;





import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../services/api';
import { toast } from 'react-toastify';
import EmployeeSidebar from '../components/EmployeeSidebar';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';

const CustomerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await orderApi.getAll();
      
      console.log('Orders API response:', response);
      
      let ordersData = [];
      
      if (Array.isArray(response)) {
        ordersData = response;
      } else if (response && Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response && Array.isArray(response.orders)) {
        ordersData = response.orders;
      } else if (response && response.success && Array.isArray(response.data)) {
        ordersData = response.data;
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

  const formatCurrency = (amount) => {
    return `$${amount ? parseFloat(amount).toFixed(2) : '0.00'}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (user?.role !== 'employee') {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <EmployeeSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 p-4 md:ml-0">
          <div className="text-red-500 bg-white p-4 rounded-lg shadow">
            Access denied. Employees only.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <EmployeeSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile Header */}
        <div className="bg-white shadow-sm border-b lg:hidden">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-800">Manage Orders</h1>
            <div className="w-6"></div> {/* Spacer for balance */}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6">
          {/* Header Section */}
          <div className="mb-6 lg:flex lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl font-bold text-gray-900 hidden lg:block">Manage Orders</h1>
              <h1 className="text-xl font-bold text-gray-900 lg:hidden mb-2">Manage Orders</h1>
              <p className="text-gray-600">Total orders: {filteredOrders.length}</p>
            </div>
            
            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              <div className="relative flex-1 min-w-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Refresh Button */}
              <button 
                onClick={fetchOrders}
                disabled={loading}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Orders Container */}
          <div className="bg-white rounded-lg shadow">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <div className="text-red-500 bg-red-50 p-4 rounded-lg">
                  <p className="font-semibold">Error loading orders</p>
                  <p className="mt-1">{error}</p>
                  <button 
                    onClick={fetchOrders}
                    className="mt-3 bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="overflow-x-auto">
                {/* Table for both desktop and mobile - scrolls horizontally on mobile */}
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Order #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order._id || order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900 text-sm">
                          {order.orderNumber}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-700 text-sm">
                          {order.customer?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-500 text-sm">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900 text-sm">
                          {formatCurrency(order.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {orders.length === 0 ? 'No orders available' : 'No orders match your search'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {orders.length === 0 ? 'Get started by creating a new order.' : 'Try adjusting your search terms.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Scroll Hint */}
          {filteredOrders.length > 0 && (
            <div className="lg:hidden mt-4 text-center">
              <p className="text-sm text-gray-500">
                ← Scroll horizontally to view all columns →
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerOrders;
