import React, { useState } from 'react';
import { 
  FaCreditCard, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaCheck,
  FaPaypal,
  FaApplePay,
  FaGooglePay,
  FaShieldAlt
} from 'react-icons/fa';

const PaymentMethodManager = ({ paymentMethods, onAdd, onEdit, onDelete, onSetDefault }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    type: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    nickname: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const getCardBrandIcon = (brand) => {
    const brandIcons = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
      paypal: <FaPaypal className="text-blue-600" />,
      apple: <FaApplePay className="text-gray-900" />,
      google: <FaGooglePay className="text-blue-500" />
    };
    return brandIcons[brand?.toLowerCase()] || <FaCreditCard />;
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleInputChange = (field, value) => {
    if (field === 'cardNumber') {
      value = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      value = formatExpiryDate(value);
    } else if (field === 'cvv') {
      value = value.replace(/[^0-9]/g, '').substring(0, 4);
    }

    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.type === 'card') {
      if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 13) {
        newErrors.cardNumber = 'Please enter a valid card number';
      }
      if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
      }
      if (!formData.cvv || formData.cvv.length < 3) {
        newErrors.cvv = 'Please enter a valid CVV';
      }
      if (!formData.cardholderName.trim()) {
        newErrors.cardholderName = 'Please enter the cardholder name';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const methodData = {
        ...formData,
        id: editingMethod?.id || `pm_${Date.now()}`,
        last4: formData.cardNumber.slice(-4),
        brand: 'Visa', // Would be detected in real implementation
        isDefault: paymentMethods.length === 0
      };

      if (editingMethod) {
        await onEdit(methodData);
      } else {
        await onAdd(methodData);
      }

      resetForm();
    } catch (error) {
      setErrors({ submit: 'Failed to save payment method' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'card',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      nickname: ''
    });
    setErrors({});
    setShowAddForm(false);
    setEditingMethod(null);
  };

  const handleEdit = (method) => {
    setEditingMethod(method);
    setFormData({
      type: method.type || 'card',
      cardNumber: `•••• •••• •••• ${method.last4}`,
      expiryDate: `${method.expiryMonth}/${method.expiryYear}`,
      cvv: '',
      cardholderName: method.cardholderName || '',
      nickname: method.nickname || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (methodId) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      await onDelete(methodId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus />
            Add Payment Method
          </button>
        )}
      </div>

      {/* Existing Payment Methods */}
      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div key={method.id} className="card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center text-white">
                  {getCardBrandIcon(method.brand)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {method.brand} •••• {method.last4}
                    </span>
                    {method.isDefault && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Expires {method.expiryMonth}/{method.expiryYear}
                    {method.nickname && ` • ${method.nickname}`}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!method.isDefault && (
                  <button
                    onClick={() => onSetDefault(method.id)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  onClick={() => handleEdit(method)}
                  className="text-gray-600 hover:text-gray-900 p-2"
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(method.id)}
                  className="text-red-600 hover:text-red-700 p-2"
                  title="Delete"
                  disabled={method.isDefault}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}

        {paymentMethods.length === 0 && !showAddForm && (
          <div className="text-center py-12 text-gray-500">
            <FaCreditCard className="text-4xl mx-auto mb-4 text-gray-300" />
            <p className="text-lg mb-2">No payment methods added</p>
            <p className="text-sm">Add a payment method to manage your subscription</p>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Type
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { type: 'card', label: 'Credit Card', icon: <FaCreditCard /> },
                  { type: 'paypal', label: 'PayPal', icon: <FaPaypal /> },
                  { type: 'apple', label: 'Apple Pay', icon: <FaApplePay /> },
                  { type: 'google', label: 'Google Pay', icon: <FaGooglePay /> }
                ].map(({ type, label, icon }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type }))}
                    className={`p-3 border rounded-lg flex flex-col items-center gap-1 text-xs transition-colors ${
                      formData.type === type
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Card Details (only for card type) */}
            {formData.type === 'card' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    className={`input-field ${errors.cardNumber ? 'border-red-300' : ''}`}
                    maxLength="19"
                    disabled={editingMethod}
                  />
                  {errors.cardNumber && (
                    <span className="text-sm text-red-600">{errors.cardNumber}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={formData.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                      placeholder="MM/YY"
                      className={`input-field ${errors.expiryDate ? 'border-red-300' : ''}`}
                      maxLength="5"
                    />
                    {errors.expiryDate && (
                      <span className="text-sm text-red-600">{errors.expiryDate}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={formData.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value)}
                      placeholder="123"
                      className={`input-field ${errors.cvv ? 'border-red-300' : ''}`}
                      maxLength="4"
                    />
                    {errors.cvv && (
                      <span className="text-sm text-red-600">{errors.cvv}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={formData.cardholderName}
                    onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                    placeholder="John Doe"
                    className={`input-field ${errors.cardholderName ? 'border-red-300' : ''}`}
                  />
                  {errors.cardholderName && (
                    <span className="text-sm text-red-600">{errors.cardholderName}</span>
                  )}
                </div>
              </>
            )}

            {/* Nickname (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nickname (Optional)
              </label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
                placeholder="Personal Card, Business Card, etc."
                className="input-field"
              />
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <FaShieldAlt className="text-blue-600 text-lg mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Secure Storage</h4>
                <p className="text-sm text-blue-800">
                  Your payment information is encrypted and stored securely. We never store your CVV.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 btn-outline"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaCheck />
                    {editingMethod ? 'Update' : 'Add'} Payment Method
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodManager;
