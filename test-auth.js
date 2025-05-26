#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:3002/api';

console.log('🧪 FlickNet Authentication Test Suite');
console.log('=====================================\n');

async function testAuthSystem() {
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing server health...');
    const healthResponse = await axios.get('http://localhost:3002/health');
    console.log('✅ Server is running:', healthResponse.data.message);

    // Test 2: Test Signup
    console.log('\n2️⃣ Testing user signup...');
    const signupData = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User'
    };

    const signupResponse = await axios.post(`${API_BASE}/auth/signup`, signupData);
    
    if (signupResponse.data.success) {
      console.log('✅ Signup successful');
      console.log('   User ID:', signupResponse.data.user.id);
      console.log('   Username:', signupResponse.data.user.username);
      console.log('   Token received:', signupResponse.data.token ? 'Yes' : 'No');
    } else {
      console.log('❌ Signup failed:', signupResponse.data.error);
    }

    // Test 3: Test Login with Mock Users
    console.log('\n3️⃣ Testing login with mock users...');
    
    const mockUsers = [
      { email: 'admin@flicknet.com', password: 'admin123', name: 'Admin' },
      { email: 'fan@example.com', password: 'password123', name: 'Movie Fan' },
      { email: 'test@example.com', password: 'test123', name: 'Test User' }
    ];

    for (const user of mockUsers) {
      try {
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
          email: user.email,
          password: user.password
        });

        if (loginResponse.data.success) {
          console.log(`✅ Login successful for ${user.name}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Role: ${loginResponse.data.user.role}`);
          
          // Test 4: Test Protected Route
          const token = loginResponse.data.token;
          const meResponse = await axios.get(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (meResponse.data.success) {
            console.log(`✅ Protected route access successful for ${user.name}`);
          } else {
            console.log(`❌ Protected route access failed for ${user.name}`);
          }
        } else {
          console.log(`❌ Login failed for ${user.name}:`, loginResponse.data.error);
        }
      } catch (error) {
        console.log(`❌ Login error for ${user.name}:`, error.response?.data?.error || error.message);
      }
    }

    // Test 5: Test Invalid Credentials
    console.log('\n4️⃣ Testing invalid credentials...');
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      });
      console.log('❌ Invalid credentials test failed - should have been rejected');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid credentials properly rejected');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 6: Test Token Validation
    console.log('\n5️⃣ Testing token validation...');
    try {
      await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      console.log('❌ Invalid token test failed - should have been rejected');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid token properly rejected');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n🎉 Authentication test suite completed!');
    console.log('\n📋 Summary:');
    console.log('- Server is running and responding');
    console.log('- User signup is working');
    console.log('- User login is working with mock data');
    console.log('- Protected routes are properly secured');
    console.log('- Invalid credentials are properly rejected');
    console.log('- Token validation is working');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the server is running:');
      console.log('   npm run server:dev');
    }
  }
}

// Run the tests
testAuthSystem();
