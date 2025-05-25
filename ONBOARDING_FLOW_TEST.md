# FlickNet User Onboarding Flow - Testing Guide

## 🧪 **Complete Testing Checklist**

### **1. User Registration & Redirect Flow**

#### Test Case 1: New User Signup
- [ ] Navigate to `/signup`
- [ ] Fill out registration form with valid data
- [ ] Submit form successfully
- [ ] Verify success message shows "Choose your subscription plan..."
- [ ] Verify automatic redirect to `/subscription?onboarding=true`
- [ ] Verify onboarding welcome header appears

#### Test Case 2: Onboarding Header Display
- [ ] Verify welcome message: "Welcome to FlickNet! 🎬"
- [ ] Verify subtitle about choosing subscription plan
- [ ] Verify blue gradient background styling

### **2. Plan Selection & Access Control**

#### Test Case 3: Free Plan Selection
- [ ] Click "Downgrade to Free" button on Free plan
- [ ] Verify immediate plan update (no payment required)
- [ ] Verify redirect to dashboard if onboarding
- [ ] Verify user subscription updated to 'free'

#### Test Case 4: Paid Plan Selection
- [ ] Click "Upgrade Now" on Basic or Premium plan
- [ ] Verify payment form modal appears
- [ ] Verify plan details displayed correctly
- [ ] Verify pricing information matches selected billing cycle

### **3. Payment Processing**

#### Test Case 5: Payment Form Validation
- [ ] Test empty form submission (should show validation errors)
- [ ] Test invalid card number (should show error)
- [ ] Test invalid expiry date (should show error)
- [ ] Test invalid CVV (should show error)
- [ ] Test missing billing address fields (should show errors)

#### Test Case 6: Successful Payment
- [ ] Fill out valid payment information:
  - Card Number: 4242 4242 4242 4242
  - Expiry: 12/25
  - CVV: 123
  - Name: Test User
  - Complete billing address
- [ ] Submit payment form
- [ ] Verify loading state during processing
- [ ] Verify payment success and receipt display

### **4. Receipt Generation & Management**

#### Test Case 7: Receipt Display
- [ ] Verify receipt shows all transaction details
- [ ] Verify plan information is correct
- [ ] Verify billing address is displayed
- [ ] Verify payment method information (last 4 digits)
- [ ] Verify transaction ID is generated

#### Test Case 8: Receipt Actions
- [ ] Test "Print Receipt" button (should trigger print dialog)
- [ ] Test "Download" button (should download JSON file)
- [ ] Test "Continue to Dashboard" button (should redirect)

### **5. Access Control Implementation**

#### Test Case 9: Free Plan Limitations
- [ ] Login with free plan user
- [ ] Verify watchlist shows limit (10 movies)
- [ ] Verify community features show lock icon
- [ ] Verify upgrade prompts appear for restricted features
- [ ] Test feature access with `useAccessControl` hook

#### Test Case 10: Basic Plan Features
- [ ] Upgrade to Basic plan
- [ ] Verify increased watchlist limit (100 movies)
- [ ] Verify community features are unlocked
- [ ] Verify HD streaming indicator
- [ ] Verify advanced search access

#### Test Case 11: Premium Plan Features
- [ ] Upgrade to Premium plan
- [ ] Verify unlimited watchlist
- [ ] Verify all features unlocked
- [ ] Verify premium badge display
- [ ] Verify exclusive content access

### **6. Payment Method Management**

#### Test Case 12: Add Payment Method
- [ ] Navigate to subscription page (non-onboarding)
- [ ] Click "Manage Payment Methods"
- [ ] Click "Add Payment Method"
- [ ] Fill out new card information
- [ ] Submit and verify card is added
- [ ] Verify first card becomes default

#### Test Case 13: Edit Payment Method
- [ ] Click edit on existing payment method
- [ ] Modify card details (expiry, name, nickname)
- [ ] Submit changes
- [ ] Verify updates are reflected

#### Test Case 14: Delete Payment Method
- [ ] Click delete on non-default payment method
- [ ] Confirm deletion
- [ ] Verify method is removed
- [ ] Verify default method cannot be deleted

#### Test Case 15: Set Default Payment Method
- [ ] Click "Set as Default" on non-default method
- [ ] Verify default status updates
- [ ] Verify only one method is marked as default

### **7. Billing History & Receipts**

#### Test Case 16: Billing History Display
- [ ] Navigate to subscription page
- [ ] Verify billing history table shows past transactions
- [ ] Verify status badges (Paid/Pending) display correctly
- [ ] Test "Download All" button

#### Test Case 17: Individual Receipt Access
- [ ] Click on invoice number in billing history
- [ ] Verify receipt opens with transaction details
- [ ] Verify receipt can be printed
- [ ] Verify receipt matches original transaction

### **8. Security & Compliance**

#### Test Case 18: Payment Security
- [ ] Verify CVV is never stored or displayed
- [ ] Verify card numbers are masked (•••• •••• •••• 1234)
- [ ] Verify security notices are displayed
- [ ] Verify HTTPS is used for all payment forms

#### Test Case 19: Data Validation
- [ ] Test XSS prevention in form inputs
- [ ] Test SQL injection prevention
- [ ] Verify input sanitization
- [ ] Test CSRF protection

### **9. Responsive Design & Accessibility**

#### Test Case 20: Mobile Responsiveness
- [ ] Test signup flow on mobile device
- [ ] Test payment form on mobile
- [ ] Test receipt display on mobile
- [ ] Verify touch interactions work properly

#### Test Case 21: Accessibility
- [ ] Test keyboard navigation through forms
- [ ] Verify screen reader compatibility
- [ ] Test color contrast compliance
- [ ] Verify focus indicators are visible

### **10. Error Handling**

#### Test Case 22: Payment Failures
- [ ] Test with declined card (4000 0000 0000 0002)
- [ ] Verify error message displays
- [ ] Verify user can retry payment
- [ ] Verify no partial charges occur

#### Test Case 23: Network Errors
- [ ] Test with network disconnection
- [ ] Verify graceful error handling
- [ ] Test retry mechanisms
- [ ] Verify user feedback for errors

## 🎯 **Success Criteria**

### **Functional Requirements**
- ✅ New users are redirected to subscription page after signup
- ✅ Payment processing works for all plan types
- ✅ Receipts are generated and accessible
- ✅ Access control enforces plan limitations
- ✅ Payment methods can be managed securely

### **Non-Functional Requirements**
- ✅ Payment forms load within 2 seconds
- ✅ All payment data is encrypted
- ✅ Mobile experience is fully functional
- ✅ Accessibility standards are met
- ✅ Error messages are user-friendly

### **Security Requirements**
- ✅ No sensitive payment data stored locally
- ✅ PCI compliance maintained
- ✅ Input validation prevents attacks
- ✅ Secure communication protocols used

## 🚀 **Ready for Production**

Once all test cases pass, the onboarding flow is ready for production deployment with:
- Complete user registration to subscription flow
- Secure payment processing
- Comprehensive receipt system
- Plan-based access control
- Professional payment method management

## 📝 **Notes for Developers**

- All payment processing is currently simulated
- Real Stripe integration requires API keys
- Access control hook can be extended for new features
- Receipt system supports PDF generation (requires additional library)
- Payment method encryption should be implemented server-side
