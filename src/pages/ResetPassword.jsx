import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api'; // Import from your API service

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Use your API service instead of direct axios call
        const response = await authApi.verifyResetToken(token);
        setIsValidToken(response.success);
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired token');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (token) {
      verifyToken();
    } else {
      setError('No reset token provided');
      setIsLoading(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    try {
      // Use your API service instead of direct axios call
      const response = await authApi.resetPassword(token, password);

      if (response.success) {
        setSuccess('Password updated successfully');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-gray-600">Verifying reset token...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Invalid Token</h2>
          <p className="text-red-500 mb-6">{error || 'This password reset link is invalid or has expired.'}</p>
          <Link 
            to="/forgot-password" 
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Request New Reset Link
          </Link>
          <div className="mt-4">
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
        <p className="text-gray-600 text-center mb-6">
          Please enter your new password below.
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-md text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              New Password *
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              required
              minLength="6"
              placeholder="Enter new password (min. 6 characters)"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
              }}
              required
              minLength="6"
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            Reset Password
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link 
            to="/login" 
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;