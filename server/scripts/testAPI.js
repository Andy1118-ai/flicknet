const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test API endpoints
const testAPI = async () => {
  console.log('🧪 Testing FlickNet API Endpoints...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data.message);
    console.log('');

    // Test 2: Get Subscription Plans (Public)
    console.log('2. Testing Subscription Plans...');
    const plansResponse = await axios.get(`${BASE_URL}/api/subscriptions/plans`);
    console.log('✅ Subscription Plans:', Object.keys(plansResponse.data.data));
    console.log('');

    // Test 3: Get Movies (Public)
    console.log('3. Testing Movies Endpoint...');
    const moviesResponse = await axios.get(`${BASE_URL}/api/movies?limit=3`);
    console.log('✅ Movies:', `Found ${moviesResponse.data.count} movies`);
    if (moviesResponse.data.data.length > 0) {
      console.log('   Sample movie:', moviesResponse.data.data[0].title);
    }
    console.log('');

    // Test 4: User Registration
    console.log('4. Testing User Registration...');
    const testUser = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User'
    };

    const signupResponse = await axios.post(`${BASE_URL}/api/auth/signup`, testUser);
    console.log('✅ User Registration:', signupResponse.data.user.username);
    const token = signupResponse.data.token;
    console.log('');

    // Test 5: User Login
    console.log('5. Testing User Login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ User Login:', loginResponse.data.user.username);
    console.log('');

    // Test 6: Protected Route (Get User Profile)
    console.log('6. Testing Protected Route...');
    const profileResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ User Profile:', profileResponse.data.user.fullName);
    console.log('');

    // Test 7: Get User Subscription
    console.log('7. Testing User Subscription...');
    const subscriptionResponse = await axios.get(`${BASE_URL}/api/subscriptions/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ User Subscription:', subscriptionResponse.data.data.plan);
    console.log('');

    // Test 8: Get Notifications
    console.log('8. Testing Notifications...');
    const notificationsResponse = await axios.get(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Notifications:', `${notificationsResponse.data.count} notifications, ${notificationsResponse.data.unreadCount} unread`);
    console.log('');

    console.log('🎉 All API tests passed successfully!');
    console.log('\n📊 API Summary:');
    console.log('- Health check: Working');
    console.log('- Public endpoints: Working');
    console.log('- User authentication: Working');
    console.log('- Protected routes: Working');
    console.log('- Database integration: Working');
    console.log('\n✅ Your FlickNet backend is fully functional!');

  } catch (error) {
    console.error('❌ API Test Failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Is the server running?');
      console.error('Make sure to start the server with: npm run server');
    } else {
      console.error('Error:', error.message);
    }
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;
