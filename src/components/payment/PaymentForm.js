import React, { useState } from 'react';
import { 
  FaCreditCard, 
  FaLock, 
  FaShieldAlt, 
  FaCheck,
  FaSpinner
} from 'react-icons/fa';

const PaymentForm = ({ plan, onSuccess, onCancel, isLoading, setIsLoading }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  });
  const [errors, setErrors] = useState({});

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
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

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBillingChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

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

    if (!formData.billingAddress.street.trim()) {
      newErrors.street = 'Please enter your street address';
    }

    if (!formData.billingAddress.city.trim()) {
      newErrors.city = 'Please enter your city';
    }

    if (!formData.billingAddress.state.trim()) {
      newErrors.state = 'Please enter your state';
    }

    if (!formData.billingAddress.zipCode.trim()) {
      newErrors.zipCode = 'Please enter your ZIP code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would integrate with Stripe here
      const paymentResult = {
        success: true,
        transactionId: `txn_${Date.now()}`,
        paymentMethod: {
          last4: formData.cardNumber.slice(-4),
          brand: 'Visa', // Would be detected from card number
          expiryMonth: formData.expiryDate.split('/')[0],
          expiryYear: '20' + formData.expiryDate.split('/')[1]
        },
        billingAddress: formData.billingAddress,
        amount: plan.price.monthly,
        plan: plan
      };

      onSuccess(paymentResult);
    } catch (error) {
      setErrors({ submit: 'Payment failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <FaLock className="text-2xl text-green-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Secure Payment</h2>
        </div>
        <p className="text-gray-600">
          Complete your subscription to <span className="font-semibold text-primary-600">{plan.name}</span>
        </p>
        <div className="mt-4 p-4 bg-primary-50 rounded-lg">
          <div className="text-2xl font-bold text-primary-600">
            ${plan.price.monthly}/month
          </div>
          <div className="text-sm text-primary-700">{plan.description}</div>
        </div>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaCreditCard className="mr-2 text-primary-600" />
            Card Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <input
                type="text"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                placeholder="1234 5678 9012 3456"
                className={`input-field ${errors.cardNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                maxLength="19"
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
                  className={`input-field ${errors.expiryDate ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
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
                  className={`input-field ${errors.cvv ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
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
                className={`input-field ${errors.cardholderName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.cardholderName && (
                <span className="text-sm text-red-600">{errors.cardholderName}</span>
              )}
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Billing Address
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={formData.billingAddress.street}
                onChange={(e) => handleBillingChange('street', e.target.value)}
                placeholder="123 Main Street"
                className={`input-field ${errors.street ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.street && (
                <span className="text-sm text-red-600">{errors.street}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.billingAddress.city}
                  onChange={(e) => handleBillingChange('city', e.target.value)}
                  placeholder="New York"
                  className={`input-field ${errors.city ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.city && (
                  <span className="text-sm text-red-600">{errors.city}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={formData.billingAddress.state}
                  onChange={(e) => handleBillingChange('state', e.target.value)}
                  placeholder="NY"
                  className={`input-field ${errors.state ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.state && (
                  <span className="text-sm text-red-600">{errors.state}</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code
              </label>
              <input
                type="text"
                value={formData.billingAddress.zipCode}
                onChange={(e) => handleBillingChange('zipCode', e.target.value)}
                placeholder="10001"
                className={`input-field ${errors.zipCode ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.zipCode && (
                <span className="text-sm text-red-600">{errors.zipCode}</span>
              )}
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <FaShieldAlt className="text-green-600 text-lg mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-green-900 mb-1">Secure & Encrypted</h4>
            <p className="text-sm text-green-800">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 btn-outline py-3"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FaCheck />
                Complete Payment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
