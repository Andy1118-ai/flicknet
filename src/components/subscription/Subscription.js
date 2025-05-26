import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaCreditCard,
  FaCheck,
  FaTimes,
  FaCrown,
  FaStar,
  FaCalendarAlt,
  FaDownload,
  FaUsers,
  FaShieldAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import PaymentForm from '../payment/PaymentForm';
import Receipt from '../payment/Receipt';
import PaymentMethodManager from '../payment/PaymentMethodManager';


const Subscription = () => {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState(user?.subscription || 'free');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showPaymentManager, setShowPaymentManager] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);

  // Check if this is part of the onboarding flow
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    setIsOnboarding(urlParams.get('onboarding') === 'true');
  }, [location]);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for casual movie watchers',
      features: [
        'Browse movie catalog',
        'Basic search functionality',
        'Community discussions',
        'Standard quality streaming',
        'Limited watchlist (10 movies)'
      ],
      limitations: [
        'Ads during streaming',
        'No offline downloads',
        'No premium content',
        'Limited customer support'
      ],
      color: 'gray',
      icon: FaUsers
    },
    {
      id: 'basic',
      name: 'Basic',
      price: { monthly: 9.99, yearly: 99.99 },
      description: 'Great for regular movie enthusiasts',
      features: [
        'Everything in Free',
        'Ad-free streaming',
        'HD quality streaming',
        'Unlimited watchlist',
        'Email support',
        'Early access to new releases'
      ],
      limitations: [
        'No 4K streaming',
        'No offline downloads',
        'Limited premium content'
      ],
      color: 'blue',
      icon: FaStar,
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: { monthly: 19.99, yearly: 199.99 },
      description: 'The ultimate movie experience',
      features: [
        'Everything in Basic',
        '4K Ultra HD streaming',
        'Offline downloads',
        'Access to premium content',
        'Priority customer support',
        'Multiple device streaming',
        'Exclusive behind-the-scenes content',
        'Advanced recommendation engine'
      ],
      limitations: [],
      color: 'gold',
      icon: FaCrown,
      popular: true
    }
  ];

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
      cardholderName: 'John Doe'
    },
    {
      id: 2,
      type: 'card',
      last4: '5555',
      brand: 'Mastercard',
      expiryMonth: 8,
      expiryYear: 2026,
      isDefault: false,
      cardholderName: 'John Doe'
    }
  ]);

  const billingHistory = [
    {
      id: 1,
      date: '2024-01-15',
      amount: 19.99,
      plan: 'Premium',
      status: 'paid',
      invoice: 'INV-2024-001'
    },
    {
      id: 2,
      date: '2023-12-15',
      amount: 19.99,
      plan: 'Premium',
      status: 'paid',
      invoice: 'INV-2023-012'
    },
    {
      id: 3,
      date: '2023-11-15',
      amount: 19.99,
      plan: 'Premium',
      status: 'paid',
      invoice: 'INV-2023-011'
    }
  ];

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    if (planId !== 'free' && planId !== user?.subscription) {
      const selectedPlanData = plans.find(p => p.id === planId);
      if (selectedPlanData) {
        setShowPaymentForm(true);
      }
    } else if (planId === 'free') {
      // Handle downgrade to free plan
      handleFreePlanSelect();
    }
  };

  const handleFreePlanSelect = async () => {
    try {
      // Update user subscription to free
      await updateUser({ subscription: 'free' });
      setSelectedPlan('free');

      if (isOnboarding) {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Failed to update to free plan:', error);
    }
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      // Update user subscription
      await updateUser({ subscription: selectedPlan });

      // Add payment method if it's new
      if (paymentResult.paymentMethod && !paymentMethods.find(pm => pm.last4 === paymentResult.paymentMethod.last4)) {
        const newPaymentMethod = {
          id: Date.now(),
          type: 'card',
          last4: paymentResult.paymentMethod.last4,
          brand: paymentResult.paymentMethod.brand,
          expiryMonth: paymentResult.paymentMethod.expiryMonth,
          expiryYear: paymentResult.paymentMethod.expiryYear,
          isDefault: paymentMethods.length === 0,
          cardholderName: paymentResult.cardholderName || 'Cardholder'
        };
        setPaymentMethods(prev => [...prev, newPaymentMethod]);
      }

      setPaymentData(paymentResult);
      setShowPaymentForm(false);
      setShowReceipt(true);
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setSelectedPlan(user?.subscription || 'free');
  };

  const handleReceiptClose = () => {
    setShowReceipt(false);
    setPaymentData(null);

    if (isOnboarding) {
      navigate('/dashboard', { replace: true });
    }
  };

  // Payment method management handlers
  const handleAddPaymentMethod = async (methodData) => {
    const newMethod = {
      ...methodData,
      id: Date.now(),
      isDefault: paymentMethods.length === 0
    };
    setPaymentMethods(prev => [...prev, newMethod]);
  };

  const handleEditPaymentMethod = async (methodData) => {
    setPaymentMethods(prev =>
      prev.map(method =>
        method.id === methodData.id ? { ...method, ...methodData } : method
      )
    );
  };

  const handleDeletePaymentMethod = async (methodId) => {
    setPaymentMethods(prev => {
      const filtered = prev.filter(method => method.id !== methodId);
      // If we deleted the default method, make the first remaining method default
      if (filtered.length > 0 && !filtered.some(method => method.isDefault)) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
  };

  const handleSetDefaultPaymentMethod = async (methodId) => {
    setPaymentMethods(prev =>
      prev.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }))
    );
  };

  const formatPrice = (price) => {
    return price === 0 ? 'Free' : `$${price}`;
  };

  const getYearlySavings = (plan) => {
    const monthlyTotal = plan.price.monthly * 12;
    const yearlyPrice = plan.price.yearly;
    const savings = monthlyTotal - yearlyPrice;
    return savings > 0 ? savings : 0;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Onboarding Header */}
      {isOnboarding && (
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome to FlickNet! 🎬</h1>
          <p className="text-xl text-blue-100 mb-2">
            Choose your subscription plan to get started
          </p>
          <p className="text-blue-200">
            You can always change your plan later in your account settings
          </p>
        </div>
      )}

      {/* Regular Header */}
      {!isOnboarding && (
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription & Billing</h1>
          <p className="text-gray-600 text-lg">
            Manage your subscription plan and billing information
          </p>
        </div>
      )}

      {/* Current Plan Status */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <h3 className="text-lg font-medium text-blue-100 mb-2">Current Plan</h3>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-2xl font-bold">{plans.find(p => p.id === user?.subscription)?.name || 'Free'}</span>
              {user?.subscription !== 'free' && (
                <span className="text-xl font-semibold text-blue-200">
                  ${plans.find(p => p.id === user?.subscription)?.price.monthly}/month
                </span>
              )}
            </div>
            <p className="text-blue-100 max-w-md">
              {plans.find(p => p.id === user?.subscription)?.description || 'Basic access to FlickNet'}
            </p>
          </div>
          <div className="flex flex-col items-center lg:items-end gap-4">
            {user?.subscription !== 'free' && (
              <>
                <div className="flex items-center gap-2 text-blue-200">
                  <FaCalendarAlt />
                  <span>Next billing: Feb 15, 2024</span>
                </div>
                <button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 font-medium py-2 px-6 rounded-lg transition-colors duration-200">
                  Manage Plan
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Plan</h2>
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <button
            className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button
            className={`px-6 py-2 rounded-md font-medium transition-all duration-200 relative ${
              billingCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setBillingCycle('yearly')}
          >
            Yearly
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = plan.id === user?.subscription;
          const price = plan.price[billingCycle];
          const savings = billingCycle === 'yearly' ? getYearlySavings(plan) : 0;

          return (
            <div
              key={plan.id}
              className={`relative card-hover p-8 text-center ${
                plan.popular ? 'ring-2 ring-primary-500 scale-105' : ''
              } ${isCurrentPlan ? 'bg-primary-50 border-primary-200' : ''} ${
                selectedPlan === plan.id ? 'ring-2 ring-secondary-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <Icon className={`text-4xl mx-auto mb-4 ${
                  plan.id === 'free' ? 'text-gray-500' :
                  plan.id === 'basic' ? 'text-primary-600' : 'text-yellow-500'
                }`} />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{formatPrice(price)}</span>
                  {price > 0 && (
                    <span className="text-gray-600">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                  )}
                </div>
                {savings > 0 && (
                  <div className="text-green-600 font-medium mb-2">Save ${savings.toFixed(2)}/year</div>
                )}
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <div className="mb-8 text-left">
                <h4 className="font-semibold text-gray-900 mb-4">Features included:</h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.limitations.length > 0 && (
                  <>
                    <h4 className="font-semibold text-gray-900 mb-4 mt-6">Limitations:</h4>
                    <ul className="space-y-3">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <FaTimes className="text-red-400 mt-1 flex-shrink-0" />
                          <span className="text-gray-600">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <div className="mt-auto">
                {isCurrentPlan ? (
                  <button className="w-full bg-gray-100 text-gray-600 font-medium py-3 px-6 rounded-lg cursor-not-allowed" disabled>
                    Current Plan
                  </button>
                ) : (
                  <button
                    className={`w-full font-medium py-3 px-6 rounded-lg transition-colors duration-200 ${
                      plan.popular
                        ? 'btn-primary'
                        : 'btn-outline'
                    }`}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    {plan.id === 'free' ? 'Downgrade to Free' : 'Upgrade Now'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Methods */}
      {!isOnboarding && user?.subscription !== 'free' && !showPaymentManager && (
        <div className="card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
            <button
              onClick={() => setShowPaymentManager(true)}
              className="btn-outline flex items-center gap-2"
            >
              <FaCreditCard />
              Manage Payment Methods
            </button>
          </div>

          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                    <FaCreditCard className="text-white text-sm" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{method.brand}</div>
                    <div className="text-gray-600">•••• •••• •••• {method.last4}</div>
                    <div className="text-sm text-gray-500">
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {method.isDefault && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      Default
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Method Manager */}
      {showPaymentManager && (
        <div className="card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Manage Payment Methods</h2>
            <button
              onClick={() => setShowPaymentManager(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕ Close
            </button>
          </div>
          <PaymentMethodManager
            paymentMethods={paymentMethods}
            onAdd={handleAddPaymentMethod}
            onEdit={handleEditPaymentMethod}
            onDelete={handleDeletePaymentMethod}
            onSetDefault={handleSetDefaultPaymentMethod}
          />
        </div>
      )}

      {/* Billing History */}
      {user?.subscription !== 'free' && (
        <div className="card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Billing History</h2>
            <button className="btn-outline flex items-center gap-2">
              <FaDownload />
              Download All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Plan</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((bill) => (
                  <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-gray-900">{formatDate(bill.date)}</td>
                    <td className="py-4 px-4 text-gray-900">{bill.plan}</td>
                    <td className="py-4 px-4 text-gray-900 font-medium">${bill.amount}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        bill.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {bill.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button className="text-primary-600 hover:text-primary-700 font-medium">
                        {bill.invoice}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Security Notice */}
      {!isOnboarding && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-start gap-4">
          <FaShieldAlt className="text-blue-600 text-2xl mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Secure Payments</h4>
            <p className="text-blue-800">
              Your payment information is encrypted and secure. We use industry-standard
              security measures to protect your data.
            </p>
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <PaymentForm
            plan={plans.find(p => p.id === selectedPlan)}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && paymentData && (
        <Receipt
          paymentData={paymentData}
          onClose={handleReceiptClose}
          onPrint={() => console.log('Print receipt')}
        />
      )}
    </div>
  );
};

export default Subscription;
