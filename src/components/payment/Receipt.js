import React from 'react';
import { 
  FaCheck, 
  FaPrint, 
  FaDownload, 
  FaFilm,
  FaCreditCard,
  FaCalendarAlt
} from 'react-icons/fa';

const Receipt = ({ paymentData, onClose, onPrint }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    window.print();
    if (onPrint) onPrint();
  };

  const handleDownload = () => {
    // In a real implementation, this would generate and download a PDF
    const receiptData = {
      ...paymentData,
      downloadedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(receiptData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `FlickNet_Receipt_${paymentData.transactionId}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Print Styles */}
        <style jsx>{`
          @media print {
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            body * { visibility: hidden; }
            .receipt-container, .receipt-container * { visibility: visible; }
            .receipt-container { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 100%; 
              background: white;
              box-shadow: none;
              border-radius: 0;
            }
          }
          .print-only { display: none; }
        `}</style>

        <div className="receipt-container p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <FaCheck className="text-2xl text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
                <p className="text-gray-600">Thank you for subscribing to FlickNet</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center mb-4">
              <FaFilm className="text-2xl text-primary-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">FlickNet</span>
            </div>
          </div>

          {/* Receipt Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Receipt Details</h2>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Transaction ID:</span>
                <div className="font-mono font-medium">{paymentData.transactionId}</div>
              </div>
              <div>
                <span className="text-gray-600">Date:</span>
                <div className="font-medium">{formatDate(new Date())}</div>
              </div>
              <div>
                <span className="text-gray-600">Payment Method:</span>
                <div className="flex items-center">
                  <FaCreditCard className="mr-1" />
                  {paymentData.paymentMethod.brand} •••• {paymentData.paymentMethod.last4}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <div className="flex items-center text-green-600">
                  <FaCheck className="mr-1" />
                  Paid
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Details */}
          <div className="border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h2>
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{paymentData.plan.name} Plan</h3>
                <p className="text-gray-600">{paymentData.plan.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  ${paymentData.amount}
                </div>
                <div className="text-sm text-gray-600">per month</div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <FaCalendarAlt className="mr-2" />
                Next billing date: {formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}
              </div>
              <div className="text-sm text-gray-600">
                You can cancel or modify your subscription at any time in your account settings.
              </div>
            </div>
          </div>

          {/* Billing Information */}
          <div className="border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h2>
            
            <div className="text-sm">
              <div className="mb-2">
                <span className="text-gray-600">Billing Address:</span>
              </div>
              <div className="ml-4">
                <div>{paymentData.billingAddress.street}</div>
                <div>
                  {paymentData.billingAddress.city}, {paymentData.billingAddress.state} {paymentData.billingAddress.zipCode}
                </div>
                <div>{paymentData.billingAddress.country}</div>
              </div>
            </div>
          </div>

          {/* Plan Features */}
          <div className="border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Plan Includes</h2>
            
            <ul className="space-y-2">
              {paymentData.plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <FaCheck className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
            <p className="text-sm text-blue-800 mb-2">
              If you have any questions about your subscription or need support, please contact us:
            </p>
            <div className="text-sm text-blue-800">
              <div>Email: support@flicknet.com</div>
              <div>Phone: 1-800-FLICKNET</div>
              <div>Help Center: flicknet.com/help</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 no-print">
            <button
              onClick={handlePrint}
              className="flex-1 btn-outline flex items-center justify-center gap-2"
            >
              <FaPrint />
              Print Receipt
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 btn-outline flex items-center justify-center gap-2"
            >
              <FaDownload />
              Download
            </button>
            <button
              onClick={onClose}
              className="flex-1 btn-primary"
            >
              Continue to Dashboard
            </button>
          </div>

          {/* Print Footer */}
          <div className="print-only mt-8 pt-4 border-t text-center text-sm text-gray-600">
            <p>Thank you for choosing FlickNet!</p>
            <p>This receipt was generated on {formatDate(new Date())}</p>
            <p>For support, visit flicknet.com/help or call 1-800-FLICKNET</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
