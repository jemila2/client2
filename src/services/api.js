
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://laundrypro-backend-production.up.railway.app';
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  response => {
    // Just return the response as-is, don't modify it
    return response;
  },
  error => {
    if (error.response) {
      console.error('API Error Details:', {
        url: error.config.url,
        method: error.config.method,
        status: error.response.status,
        data: error.response.data,
      });
      
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Create a proper response handler function
const handleApiResponse = (response) => {
  // Handle the {success: true, data: {...}} format from your backend
  if (response.data && typeof response.data === 'object') {
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data; // Return the actual data
    }
    return response.data; // Return the entire response object
  }
  return response.data; // Fallback
};

const ROLE_UPDATE_ENDPOINT = `${API_BASE_URL}/roles/update`;
export const apiService = {
  // Auth API
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (profileData) => api.put('/auth/profile', profileData),
  },

  // Customer API
  customers: {
    getAll: (params = {}) => api.get('/customers', { params }),
    getById: (id) => api.get(`/customers/${id}`),
    create: (customerData) => api.post('/customers', customerData),
    update: (id, customerData) => api.put(`/customers/${id}`, customerData),
    delete: (id) => api.delete(`/customers/${id}`),
  },

  // Order API (with improved structure)
  orders: {
    getAll: (params = {}) => api.get('/orders', { params }),
    getById: (id) => api.get(`/orders/${id}`),
    create: (orderData) => api.post('/orders', orderData),
    update: (id, orderData) => api.put(`/orders/${id}`, orderData),
    updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
    delete: (id) => api.delete(`/orders/${id}`),
    getCustomerOrders: (customerId, params = {}) => 
      api.get('/orders', { params: { ...params, customer: customerId } }),
  },

  // Employee API
  employees: {
    getAll: () => api.get('/employees'),
    getTasks: (employeeId) => api.get(`/employees/${employeeId}/tasks`),
    getStats: (employeeId) => api.get(`/employees/${employeeId}/stats`),
    create: (employeeData) => api.post('/employees', employeeData),
    update: (id, employeeData) => api.put(`/employees/${id}`, employeeData),
    delete: (id) => api.delete(`/employees/${id}`),
  },

  // Other API endpoints (simplified for brevity)
  tasks: {
    getAll: (includeCompleted = false) => 
      api.get('/tasks', { params: { includeCompleted } }),
    getById: (id) => api.get(`/tasks/${id}`),
    create: (taskData) => api.post('/tasks', taskData),
    update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
    updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
    delete: (id) => api.delete(`/tasks/${id}`),
    getEmployeeTasks: (employeeId) => api.get(`/tasks/employee/${employeeId}`),
  },

  // Add other API groups as needed (users, inventory, suppliers, etc.)
};

export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  }
};

// Customer API
export const customerApi = {
  create: async (customerData) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  getAll: async (params = {}) => {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  update: async (id, customerData) => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  }
};

// Employee API
export const employeeApi = {
  getTasks: async (employeeId) => {
    const response = await api.get(`/employees/${employeeId}/tasks`);
    return response.data;
  },

  getStats: async (employeeId) => {
    const response = await api.get(`/employees/${employeeId}/stats`);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/employees');
    return response.data;
  },

  create: async (employeeData) => {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  update: async (id, employeeData) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  }
};

// Employee Requests API
export const employeeRequestApi = {
  getAll: async () => {
    const response = await api.get('/employee-requests');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/employee-requests/${id}`);
    return response.data;
  },

  create: async (requestData) => {
    const response = await api.post('/employee-requests', requestData);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/employee-requests/${id}`, { status });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/employee-requests/${id}`);
    return response.data;
  }
};

// Supply API
export const supplyApi = {
  request: async (employeeId) => {
    const response = await api.post('/supplies', { employeeId });
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/supplies');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/supplies/${id}`);
    return response.data;
  },

  update: async (id, supplyData) => {
    const response = await api.put(`/supplies/${id}`, supplyData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/supplies/${id}`);
    return response.data;
  }
};

// Task API - FIXED
export const taskApi = {
  getAll: async (includeCompleted = false) => {
    try {
      const response = await api.get('/tasks', { 
        params: { includeCompleted } 
      });
      
      console.log('Tasks API response:', response); // DEBUG
      
      // Handle different response structures
      if (response.data && Array.isArray(response.data)) {
        return { data: response.data, success: true };
      } else if (response.data && Array.isArray(response.data.data)) {
        return { data: response.data.data, success: true };
      } else if (response.data && Array.isArray(response.data.tasks)) {
        return { data: response.data.tasks, success: true };
      } else {
        console.warn('Unexpected tasks response structure:', response.data);
        return { data: [], success: false };
      }
    } catch (error) {
      console.error('Tasks API error:', error);
      return { data: [], success: false, error: error.message };
    }
  }
};

// In your services/api.js, check the orderApi.create method
export const orderApi = {
  create: async (orderData) => {
    try {
      console.log('Sending order data to API:', orderData);
      const response = await api.post('/orders', orderData);
      console.log('Order creation API response:', response);
      return response.data;
    } catch (error) {
      console.error('Order creation API error:', error);
      throw error;
    }
  },

    getCustomerOrders: async (customerId, params = {}) => {
    try {
      console.log('Fetching customer orders for:', customerId);
      const response = await api.get(`/orders/customer/${customerId}`, { params });
      console.log('Customer orders response:', response);
      
      // Handle different response structures
      if (response.data && Array.isArray(response.data)) {
        return { data: response.data, success: true };
      } else if (response.data && Array.isArray(response.data.data)) {
        return { data: response.data.data, success: true };
      } else if (response.data && Array.isArray(response.data.orders)) {
        return { data: response.data.orders, success: true };
      } else {
        console.warn('Unexpected customer orders response structure:', response.data);
        return { data: [], success: false };
      }
    } catch (error) {
      console.error('Customer orders API error:', error);
      return { data: [], success: false, error: error.message };
    }
  },


  
  getAllOrders: async (params = {}) => {
    try {
      console.log('Fetching all orders with params:', params);
      const response = await api.get('/orders', { params });
      console.log('All orders response structure:', response);
      
      // Handle the specific structure: {success: boolean, count: number, data: array}
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        console.log('Found orders in response.data.data:', response.data.data.length);
        return { 
          data: response.data.data, 
          success: true,
          count: response.data.count 
        };
      } 
      // Handle other possible structures
      else if (response.data && Array.isArray(response.data)) {
        return { data: response.data, success: true };
      } else if (response.data && Array.isArray(response.data.orders)) {
        return { data: response.data.orders, success: true };
      } else {
        console.warn('Unexpected orders response structure:', response.data);
        return { data: [], success: false, rawResponse: response.data };
      }
    } catch (error) {
      console.error('All orders API error:', error);
      return { data: [], success: false, error: error.message };
    }
  },
  
  
  getAllAdmin: async (params = {}) => {
    try {
      console.log('Fetching all orders for admin with params:', params);
      const response = await api.get('/admin/orders', { params });
      console.log('Admin orders response:', response);
      
      // Handle different response structures
      if (response.data && Array.isArray(response.data)) {
        return { data: response.data, success: true };
      } else if (response.data && Array.isArray(response.data.data)) {
        return { data: response.data.data, success: true };
      } else if (response.data && Array.isArray(response.data.orders)) {
        return { data: response.data.orders, success: true };
      } else {
        console.warn('Unexpected admin orders response structure:', response.data);
        return { data: [], success: false };
      }
    } catch (error) {
      console.error('Admin orders API error:', error);
      return { data: [], success: false, error: error.message };
    }
  },
  
  
  getAll: async (params = {}) => {
    try {
      console.log('Fetching orders with params:', params);
      const response = await api.get('/orders', { params });
      console.log('Orders fetch API response:', response);
      
      // Handle different response structures
      if (response.data && Array.isArray(response.data)) {
        return { data: response.data, success: true };
      } else if (response.data && Array.isArray(response.data.data)) {
        return { data: response.data.data, success: true };
      } else if (response.data && Array.isArray(response.data.orders)) {
        return { data: response.data.orders, success: true };
      } else {
        console.warn('Unexpected orders response structure:', response.data);
        // Return the full response to see what's actually there
        return { data: response.data, success: false };
      }
    } catch (error) {
      console.error('Orders fetch API error:', error);
      return { data: [], success: false, error: error.message };
    }
  }
};
export const userApi = {
  getAll: async () => {
    const response = await api.get('/users');
    return handleApiResponse(response);
  },

  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return handleApiResponse(response);
  },

  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return handleApiResponse(response);
  },

  updateRole: async (userId, newRole) => {
    try {
      console.log('Updating role for user:', userId, 'to:', newRole);
      
      // Try the most likely endpoints in order
      const endpoints = [
        { method: 'patch', url: `/users/${userId}/role`, data: { role: newRole } },
        { method: 'put', url: `/users/${userId}`, data: { role: newRole } },
        { method: 'patch', url: `/users/${userId}`, data: { role: newRole } },
        { method: 'post', url: `/admin/users/${userId}/role`, data: { role: newRole } }
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log('Trying endpoint:', endpoint.url, 'method:', endpoint.method);
          const response = await api[endpoint.method](endpoint.url, endpoint.data);
          console.log('Role update successful with endpoint:', endpoint.url);
          return handleApiResponse(response);
        } catch (err) {
          console.log('Endpoint failed:', endpoint.url, 'Status:', err.response?.status);
          // Continue to next endpoint
          continue;
        }
      }
      
      // If all endpoints fail, throw a more descriptive error
      throw new Error('Role update failed: No valid endpoint found. Check backend API routes.');
      
    } catch (error) {
      console.error('Role update error:', error);
      
      // Provide more detailed error information
      const errorDetails = {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config ? {
          url: error.config.url,
          method: error.config.method,
          data: error.config.data
        } : undefined
      };
      
      console.error('Role update error details:', errorDetails);
      throw errorDetails;
    }
  },

  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return handleApiResponse(response);
  }
};

export const inventoryApi = {
  getAll: async () => {
    const response = await api.get('/inventory');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },

  create: async (itemData) => {
    const response = await api.post('/inventory', itemData);
    return response.data;
  },

  update: async (id, itemData) => {
    const response = await api.put(`/inventory/${id}`, itemData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  }
};

// Supplier API
export const supplierApi = {
  getAll: async () => {
    const response = await api.get('/suppliers');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  create: async (supplierData) => {
    const response = await api.post('/suppliers', supplierData);
    return response.data;
  },

  update: async (id, supplierData) => {
    const response = await api.put(`/suppliers/${id}`, supplierData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  }
};

// Payment API
export const paymentApi = {
  getAll: async () => {
    const response = await api.get('/payments');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  create: async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  update: async (id, paymentData) => {
    const response = await api.put(`/payments/${id}`, paymentData);
    return response.data;
  },

  process: async (orderId, paymentData) => {
    const response = await api.post(`/payments/process/${orderId}`, paymentData);
    return response.data;
  }
};

// Dashboard API
export const dashboardApi = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  getRecentOrders: async () => {
    const response = await api.get('/dashboard/recent-orders');
    return response.data;
  },

  getEmployeePerformance: async () => {
    const response = await api.get('/dashboard/employee-performance');
    return response.data;
  }
};

// Admin API
export const adminApi = {
  checkAdminExists: async () => {
    const response = await api.get('/admin/admin-exists');
    return response.data;
  },

  getSystemStats: async () => {
    const response = await api.get('/admin/system-stats');
    return response.data;
  },

  getAuditLogs: async () => {
    const response = await api.get('/admin/audit-logs');
    return response.data;
  }
};

// Helper functions
export const getCustomers = async (params = {}) => {
  try {
    const response = await api.get('/customers', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

export const deleteCustomer = async (id) => {
  try {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

export const createCustomer = async (customerData) => {
  try {
    const response = await api.post('/customers', customerData);
    return response.data;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

export const updateCustomer = async (id, customerData) => {
  try {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

export default api;