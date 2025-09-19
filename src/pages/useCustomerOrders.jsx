// hooks/useCustomerOrders.js
import { useEffect, useState } from 'react';
import { orderApi } from '../services/api';

const useCustomerOrders = (userId) => {
  const [orders, setOrders] = useState({ pending: 0, completed: 0, total: 0 });
  const [orderList, setOrderList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Use the orderApi from your service
        const response = await orderApi.getAll({ user: userId });
        const allOrders = response.data || response;
        
        setOrderList(allOrders);
        setOrders({
          pending: allOrders.filter(o => o.status === 'pending' || o.status === 'processing').length,
          completed: allOrders.filter(o => o.status === 'completed' || o.status === 'delivered').length,
          total: allOrders.length
        });
      } catch (err) {
        console.error('Error fetching customer orders:', err);
        setError(err.message || 'Failed to fetch orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  return { 
    orders, 
    orderList, 
    isLoading, 
    error,
    refresh: () => {
      setIsLoading(true);
      // This will trigger the useEffect again
      setOrders({ pending: 0, completed: 0, total: 0 });
      setOrderList([]);
    }
  };
};

export default useCustomerOrders;