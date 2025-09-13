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

  // Check if admin exists on component mount
  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        console.log('Checking if admin exists...');
        
        // Try multiple approaches to check for admin accounts
        try {
          // 1. Try the correct API endpoint first
          const response = await api.get('/api/admin/admin-exists', {
            timeout: 10000
          });
          setAdminExists(response.data.adminExists);
          console.log('Admin exists (API):', response.data.adminExists);
        } catch (apiError) {
          console.log('API endpoint failed, trying direct endpoint...');
          
          // 2. Try direct fetch to the correct endpoint
          try {
            const response = await fetch('https://laundrypro-backend-production.up.railway.app/api/admin/admin-exists', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              setAdminExists(data.adminExists);
              console.log('Admin exists (direct):', data.adminExists);
            } else {
              throw new Error('Admin check failed');
            }
          } catch (directError) {
            console.log('Direct endpoint also failed, checking users for admins...');
            
            // 3. Final fallback - check if any users have admin role
            try {
              const usersResponse = await fetch('https://laundrypro-backend-production.up.railway.app/api/users', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
              
              if (usersResponse.ok) {
                const users = await usersResponse.json();
                const adminUsers = users.filter(u => u.role === 'admin');
                setAdminExists(adminUsers.length > 0);
                console.log('Admin exists (users check):', adminUsers.length > 0);
              } else {
                setAdminExists(false);
              }
            } catch (usersError) {
              console.log('All admin check methods failed');
              setAdminExists(false);
            }
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
  }, [api]);

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

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting to create admin account...');
      
      // Try the correct API endpoint
      const response = await api.post('/api/admin/register-admin', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        secretKey: formData.secretKey
      }, {
        timeout: 30000
      });

      toast.success('Admin account created successfully!');
      
      // Automatically log in the new admin
      try {
        const loginResponse = await api.post('/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
        
        if (loginResponse.data.token) {
          localStorage.setItem('token', loginResponse.data.token);
          // Update auth context
          login(loginResponse.data.user, loginResponse.data.token);
          toast.success('Logged in successfully!');
          navigate('/dashboard');
        }
      } catch (loginError) {
        console.error('Auto-login failed:', loginError);
        toast.info('Admin account created. Please log in manually.');
        navigate('/login');
      }
      
      setAdminExists(true);
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response?.status === 403) {
        const errorMessage = error.response.data?.error || 'Admin already exists or invalid secret key';
        setRegistrationError(errorMessage);
        toast.error(errorMessage);
        
        // If we get a 403, it means an admin already exists
        setAdminExists(true);
        
        // Try to automatically log in with the provided credentials
        try {
          const loginResponse = await api.post('/api/auth/login', {
            email: formData.email,
            password: formData.password
          });
          
          if (loginResponse.data.token) {
            localStorage.setItem('token', loginResponse.data.token);
            login(loginResponse.data.user, loginResponse.data.token);
            toast.success('Logged in successfully!');
            navigate('/dashboard');
          }
        } catch (loginError) {
          console.log('Auto-login after failed registration attempt:', loginError);
        }
      } else if (error.response?.data?.error) {
        setRegistrationError(error.response.data.error);
        toast.error(error.response.data.error);
      } else {
        const errorMsg = 'Failed to create admin account. Please try again.';
        setRegistrationError(errorMsg);
        toast.error(errorMsg);
      }
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
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
        </div>
        <p className="text-center text-gray-600 mt-4">Checking admin status...</p>
      </div>
    );
  }

  // If admin already exists, don't show the form
  if (adminExists) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
        <h3 className="text-xl font-bold mb-4 text-center text-green-600">Admin Account Exists</h3>
        <p className="text-gray-600 text-center">
          An admin account has already been registered for this system.
        </p>
        {registrationError && (
          <p className="text-sm text-red-500 text-center mt-2">
            Error: {registrationError}
          </p>
        )}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Login
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
            className="w-full p-2 border border-gray-300 rounded mt-1"
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
            className="w-full p-2 border border-gray-300 rounded mt-1"
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
            className="w-full p-2 border border-gray-300 rounded mt-1"
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
            className="w-full p-2 border border-gray-300 rounded mt-1"
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
            className="w-full p-2 border border-gray-300 rounded mt-1"
            placeholder="Enter the admin setup key"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">Hint: ADMIN_SETUP_2024</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
        </button>
      </form>
    </div>
  );
};

export default AdminRegistrationForm;