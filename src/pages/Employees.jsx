import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import { employeeApi } from "../services/api"; // Import from your API service

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authToken, user } = useAuth(); 

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await employeeApi.getAll();
        setEmployees(response.data || response);
        setError(null);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setError(err.response?.data?.message || "Failed to fetch employees");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const deleteEmployee = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      await employeeApi.delete(id);
      setEmployees(employees.filter((emp) => emp._id !== id));
      // Show success message
      alert("Employee deleted successfully");
    } catch (err) {
      console.error("Error deleting employee:", err);
      alert(err.response?.data?.message || "Failed to delete employee");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Employees</h1>
        <Link
          to="/employees/add"
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          + Add Employee
        </Link>
      </div>

      {employees.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 text-lg mb-4">No employees found</p>
          <Link
            to="/employees/add"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Employee
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                            {emp.name?.charAt(0)?.toUpperCase() || 'E'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {emp.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {emp.employeeId || emp._id?.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        emp.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        emp.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {emp.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {emp.phone || emp.contact || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₦{emp.salary?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        emp.status === 'active' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {emp.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/employees/edit/${emp._id}`}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-xs"
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/employees/${emp._id}`}
                          className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors text-xs"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => deleteEmployee(emp._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        Showing {employees.length} employee{employees.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default Employees;