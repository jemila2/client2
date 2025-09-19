import { useEffect, useState, useCallback } from 'react';
import { orderApi } from '../services/api';

const useEmployeeOrders = (employeeId = null) => {
  const [orders, setOrders] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    recentOrders: [],
    allOrders: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Build query parameters
      const params = {};
      if (employeeId) {
        params.assignedTo = employeeId; // Filter by employee if ID provided
      }
      
      // Use the orderApi service
      const response = await orderApi.getAll(params);
      const allOrders = Array.isArray(response.data) ? response.data : 
                        Array.isArray(response) ? response : [];
      
      if (!Array.isArray(allOrders)) {
        throw new Error('Invalid response format: expected array');
      }

      setOrders({
        total: allOrders.length,
        pending: allOrders.filter(o => o.status === 'pending').length,
        processing: allOrders.filter(o => o.status === 'processing' || o.status === 'in-progress').length,
        completed: allOrders.filter(o => o.status === 'completed' || o.status === 'delivered').length,
        recentOrders: allOrders
          .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
          .slice(0, 5),
        allOrders: allOrders
      });
      
      return allOrders;
    } catch (err) {
      console.error('Error fetching employee orders:', {
        message: err.message,
        response: err.response?.data
      });
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to fetch orders';
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Function to update order status
  const updateOrderStatus = useCallback(async (orderId, status) => {
    try {
      await orderApi.updateStatus(orderId, status);
      
      // Update local state
      setOrders(prev => {
        const updatedOrders = prev.allOrders.map(order => 
          order._id === orderId ? { ...order, status } : order
        );
        
        return {
          total: updatedOrders.length,
          pending: updatedOrders.filter(o => o.status === 'pending').length,
          processing: updatedOrders.filter(o => o.status === 'processing' || o.status === 'in-progress').length,
          completed: updatedOrders.filter(o => o.status === 'completed' || o.status === 'delivered').length,
          recentOrders: updatedOrders
            .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
            .slice(0, 5),
          allOrders: updatedOrders
        };
      });
      
      return true;
    } catch (err) {
      console.error('Error updating order status:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to update order status';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Function to refresh orders
  const refreshOrders = useCallback(() => {
    return fetchOrders();
  }, [fetchOrders]);

  return { 
    orders, 
    isLoading, 
    error, 
    updateOrderStatus, 
    refreshOrders 
  };
};

export default useEmployeeOrders;