// context/OrdersContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { orderApi } from '../services/api'; // Use your existing API service
import { useAuth } from './AuthContext';

const OrdersContext = createContext();

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchOrders = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use your existing orderApi instead of direct axios calls
      const ordersData = await orderApi.getAll(params);
      
      // Handle different response structures
      const ordersArray = Array.isArray(ordersData) 
        ? ordersData 
        : ordersData?.data || ordersData?.orders || [];
      
      setOrders(ordersArray);
      return ordersArray;
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.message || 'Failed to fetch orders');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const createOrder = async (orderData) => {
    try {
      setError(null);
      const newOrder = await orderApi.create(orderData);
      
      // Handle different response structures
      const order = newOrder.data || newOrder;
      
      setOrders(prev => [...prev, order]);
      return order;
    } catch (err) {
      console.error('Failed to create order:', err);
      setError(err.message || 'Failed to create order');
      throw err;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      setError(null);
      const updatedOrder = await orderApi.updateStatus(orderId, status);
      
      // Handle different response structures
      const order = updatedOrder.data || updatedOrder;
      
      setOrders(prev => prev.map(o => 
        o._id === orderId || o.id === orderId ? { ...o, ...order } : o
      ));
      return order;
    } catch (err) {
      console.error('Failed to update order:', err);
      setError(err.message || 'Failed to update order');
      throw err;
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      setError(null);
      await orderApi.delete(orderId);
      setOrders(prev => prev.filter(o => o._id !== orderId && o.id !== orderId));
    } catch (err) {
      console.error('Failed to delete order:', err);
      setError(err.message || 'Failed to delete order');
      throw err;
    }
  };

  const getOrderById = (orderId) => {
    return orders.find(o => o._id === orderId || o.id === orderId);
  };

  const getCustomerOrders = (customerId) => {
    return orders.filter(o => 
      o.customer?._id === customerId || 
      o.customer?.id === customerId ||
      o.customerId === customerId
    );
  };

  const clearError = () => setError(null);

  const value = {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    getOrderById,
    getCustomerOrders,
    clearError
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
}

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};