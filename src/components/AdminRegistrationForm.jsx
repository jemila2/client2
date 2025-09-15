import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AdminRegistrationForm = ({ onSuccess }) => {
  const { api, user, isAdmin, loading: authLoading, login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', secretKey: ''
  });
  const [loading, setLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [registrationError, setRegistrationError] = useState('');
  const [adminCreated, setAdminCreated] = useState(false);

  // Check if admin exists on component mount
  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const API_BASE_URL = 'https://laundrypro-backend-production.up.railway.app';
        const response = await fetch(`${API_BASE_URL}/admin/admin-exists`);
        
        if (response.ok) {
          const data = await response.json();
          setAdminExists(data.adminExists);
        } else {
          // Fallback: check all users for admin role
          try {
            const usersResponse = await fetch(`${API_BASE_URL}/api/users`);
            if (usersResponse.ok) {
              const users = await usersResponse.json();
              const adminUsers = Array.isArray(users) ? users.filter(u => u.role === 'admin') : [];
              setAdminExists(adminUsers.length > 0);
            } else {
              setAdminExists(false);
            }
          } catch (usersError) {
            console.error('Failed to check users:', usersError);
            setAdminExists(false);
          }
        }
      } catch (error) {
        console.error('Error checking admin existence:', error);
        setAdminExists(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminExists();
  }, []);

  // If user is logged in as admin, redirect to dashboard
  useEffect(() => {
    if (!authLoading && user && isAdmin()) {
      toast.info('You are already logged in as admin. Redirecting to dashboard...');
      navigate('/dashboard');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRegistrationError('');

    const trimmedFormData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
      confirmPassword: formData.confirmPassword.trim(),
      secretKey: formData.secretKey.trim()
    };

    // Validation
    if (trimmedFormData.password !== trimmedFormData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    if (trimmedFormData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (!trimmedFormData.secretKey) {
      toast.error('Secret key is required');
      setLoading(false);
      return;
    }

    try {
      const API_BASE_URL = 'https://laundrypro-backend-production.up.railway.app';
      const response = await fetch(`${API_BASE_URL}/admin/register-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedFormData.name,
          email: trimmedFormData.email,
          password: trimmedFormData.password,
          secretKey: trimmedFormData.secretKey
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Admin account created successfully!');
        setAdminCreated(true);
        setAdminExists(true);
        
        // Try to auto-login
        try {
          await login(trimmedFormData.email, trimmedFormData.password);
          navigate('/dashboard');
        } catch (loginError) {
          console.error('Auto-login failed:', loginError);
          toast.info('Admin account created. Please log in manually.');
          navigate('/login');
        }

        if (onSuccess) onSuccess();
      } else {
        throw new Error(data.error || 'Failed to create admin account');
      }
    } catch (error) {
      console.error('Registration failed:', error.message);
      setRegistrationError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Show loading while checking admin status
  if (checkingAdmin) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Checking admin status...</span>
        </div>
      </div>
    );
  }

  // If admin already exists or was just created, don't show the form
  if (adminExists || adminCreated) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
        <div className="text-center text-green-500 mb-4">
          <i className="fas fa-check-circle text-4xl"></i>
        </div>
        <h3 className="text-xl font-bold mb-4 text-center text-green-600">
          {adminCreated ? 'Admin Account Created Successfully!' : 'Admin Account Exists'}
        </h3>
        <p className="text-gray-600 text-center mb-4">
          {adminCreated 
            ? 'Your admin account has been created successfully. You can now start creating customers.' 
            : 'An admin account has already been registered for this system.'
          }
        </p>
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(adminCreated ? '/dashboard' : '/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            {adminCreated ? 'Go to Dashboard' : 'Go to Login'}
          </button>
        </div>
      </div>
    );
  }

  // Show the registration form only if no admin exists
  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-4 text-center">Initial Admin Setup</h3>
      <p className="text-gray-600 mb-4 text-center text-sm">
        Create the first admin account for your application
      </p>
      
      {registrationError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p>{registrationError}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name *</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter admin full name"
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Email *</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter admin email address"
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Password *</label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Create a strong password (min. 6 characters)"
            minLength="6"
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm Password *</label>
          <input
            type="password"
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Confirm your password"
            minLength="6"
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Admin Secret Key *</label>
          <input
            type="password"
            name="secretKey"
            required
            value={formData.secretKey}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter the admin setup key"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Contact your system administrator for the secret key
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
        >
          {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
        </button>
      </form>
    </div>
  );
};

export default AdminRegistrationForm;