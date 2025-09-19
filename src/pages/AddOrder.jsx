import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi, customerApi } from '../services/api'; // Import from your API service
import { useAuth } from '../context/AuthContext';

const AddOrder = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [services, setServices] = useState([
    { type: 'Wash & Fold', quantity: 1, price: 15.00 }
  ]);
  const [pickupDate, setPickupDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user?.role === 'customer') {
      setSelectedCustomer(user._id);
      setPickupAddress(user.address || '');
      setDeliveryAddress(user.address || '');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === 'admin') {
      const fetchCustomers = async () => {
        try {
          const response = await customerApi.getAll();
          setCustomers(response.data || response);
        } catch (err) {
          setError('Failed to fetch customers');
        }
      };
      fetchCustomers();
    }
  }, [user]);

  const handleServiceChange = (index, field, value) => {
    const newServices = [...services];
    newServices[index][field] = field === 'quantity' || field === 'price' ? Number(value) : value;
    setServices(newServices);
  };

  const addService = () => {
    setServices([...services, { type: 'Wash & Fold', quantity: 1, price: 15.00 }]);
  };

  const removeService = (index) => {
    if (services.length > 1) {
      const newServices = services.filter((_, i) => i !== index);
      setServices(newServices);
    }
  };

  const calculateTotal = () => {
    return services.reduce((total, service) => total + (service.quantity * service.price), 0);
  };

// In your AddOrder component, modify the handleSubmit function:
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  setLoading(true);

  // Validation
  if (!selectedCustomer) {
    setError('Please select a customer');
    setLoading(false);
    return;
  }

  if (!pickupDate) {
    setError('Please select a pickup date');
    setLoading(false);
    return;
  }

  if (services.some(service => service.quantity <= 0 || service.price <= 0)) {
    setError('Please check service quantities and prices');
    setLoading(false);
    return;
  }

  try {
    const orderData = {
      customer: selectedCustomer,
      items: services.map(service => ({
        type: service.type,
        quantity: service.quantity,
        price: service.price,
        description: service.type
      })),
      pickupDate,
      deliveryDate: deliveryDate || undefined,
      specialInstructions,
      pickupAddress: pickupAddress || undefined,
      deliveryAddress: deliveryAddress || undefined,
      totalAmount: calculateTotal(),
      status: 'pending'
    };

    console.log('Creating order with data:', orderData);
    
    const response = await orderApi.create(orderData);
    console.log('Order creation response:', response);
    
    setSuccess('Order created successfully!');
    
    // Test: Immediately try to fetch orders to see if they appear
    setTimeout(async () => {
      try {
        console.log('Testing: Fetching orders immediately after creation...');
        const testResponse = await orderApi.getAll();
        console.log('Orders after creation:', testResponse);
      } catch (testError) {
        console.error('Error testing orders fetch:', testError);
      }
      
      navigate(user?.role === 'admin' ? '/orders' : '/customer/orders');
    }, 2000);
    
  } catch (err) {
    console.error('Order creation error:', err);
    console.error('Error details:', err.response);
    setError(err.response?.data?.message || 'Failed to create order. Please try again.');
  } finally {
    setLoading(false);
  }
};
  const serviceTypes = [
    { value: 'Wash & Fold', label: 'Wash & Fold', basePrice: 15.00 },
    { value: 'Dry Clean', label: 'Dry Clean', basePrice: 5.00 },
    { value: 'Ironing', label: 'Ironing', basePrice: 10.00 },
    { value: 'Stain Removal', label: 'Stain Removal', basePrice: 8.00 },
    { value: 'Special Care', label: 'Special Care', basePrice: 20.00 }
  ];

  const handleServiceTypeChange = (index, serviceType) => {
    const selectedService = serviceTypes.find(st => st.value === serviceType);
    if (selectedService) {
      handleServiceChange(index, 'type', serviceType);
      handleServiceChange(index, 'price', selectedService.basePrice);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {user?.role === 'admin' ? 'Create New Order' : 'Place Laundry Order'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md">
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Customer Selection (Admin Only) */}
        {user?.role === 'admin' && (
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-medium">Customer *</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              required
            >
              <option value="">Select a customer</option>
              {customers.map(customer => (
                <option key={customer._id} value={customer._id}>
                  {customer.name} - {customer.phone} {customer.email ? `(${customer.email})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Address Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Pickup Address</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Enter pickup address"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Delivery Address</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Enter delivery address"
            />
          </div>
        </div>

        {/* Date Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Pickup Date *</label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Delivery Date</label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              min={pickupDate || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Laundry Services */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Laundry Services</h3>
            <button
              type="button"
              onClick={addService}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Service
            </button>
          </div>

          {services.map((service, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <label className="block text-gray-700 mb-1 text-sm">Service Type *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={service.type}
                    onChange={(e) => handleServiceTypeChange(index, e.target.value)}
                    required
                  >
                    {serviceTypes.map(st => (
                      <option key={st.value} value={st.value}>
                        {st.label} (₦{st.basePrice})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 text-sm">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={service.quantity}
                    onChange={(e) => handleServiceChange(index, 'quantity', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 text-sm">Price (₦) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={service.price}
                    onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 text-sm">Total (₦)</label>
                  <div className="px-3 py-2 bg-gray-100 rounded text-sm font-medium">
                    ₦{(service.quantity * service.price).toFixed(2)}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeService(index)}
                className="text-sm text-red-600 hover:text-red-800 disabled:text-red-300"
                disabled={services.length <= 1}
              >
                Remove Service
              </button>
            </div>
          ))}
        </div>

        {/* Special Instructions */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Special Instructions</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="Fragile items, allergies, special handling instructions, etc."
          />
        </div>

        {/* Order Summary */}
        <div className="mb-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold mb-4 text-blue-800">Order Summary</h3>
          <div className="space-y-2">
            {services.map((service, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{service.type} (x{service.quantity})</span>
                <span>₦{(service.quantity * service.price).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-blue-200 mt-4 pt-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total Amount:</span>
              <span className="text-blue-800">₦{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Order...' : (user?.role === 'admin' ? 'Create Order' : 'Place Order')}
        </button>
      </form>
    </div>
  );
};

export default AddOrder;