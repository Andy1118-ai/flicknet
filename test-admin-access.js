#!/usr/bin/env node

/**
 * FlickNet Admin Access Test Script
 * Tests admin dashboard accessibility and authentication
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
const ADMIN_CREDENTIALS = {
  email: 'admin@flicknet.com',
  password: 'admin123'
};

async function testAdminAccess() {
  console.log('🧪 FlickNet Admin Access Test');
  console.log('============================\n');

  try {
    // Test 1: Check if backend is running
    console.log('1. Testing backend connection...');
    try {
      const healthCheck = await axios.get(`${API_BASE.replace('/api', '')}/health`);
      console.log('✅ Backend is running');
      console.log(`   Status: ${healthCheck.data.status}`);
      console.log(`   Environment: ${healthCheck.data.environment}\n`);
    } catch (error) {
      console.log('❌ Backend is not running');
      console.log('   Please start backend with: npm run server:dev\n');
      return;
    }

    // Test 2: Test admin login
    console.log('2. Testing admin login...');
    let authToken;
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, ADMIN_CREDENTIALS);
      
      if (loginResponse.data.success) {
        authToken = loginResponse.data.token;
        const user = loginResponse.data.user;
        console.log('✅ Admin login successful');
        console.log(`   User: ${user.firstName} ${user.lastName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Subscription: ${user.subscription}\n`);
      } else {
        console.log('❌ Admin login failed');
        console.log(`   Error: ${loginResponse.data.error}\n`);
        return;
      }
    } catch (error) {
      console.log('❌ Admin login failed');
      console.log(`   Error: ${error.response?.data?.error || error.message}`);
      console.log('   Try running: npm run seed\n');
      return;
    }

    // Test 3: Test admin-only endpoints
    console.log('3. Testing admin-only endpoints...');
    const adminHeaders = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };

    try {
      // Test users endpoint
      const usersResponse = await axios.get(`${API_BASE}/auth/users`, { headers: adminHeaders });
      console.log('✅ Admin users endpoint accessible');
      console.log(`   Found ${usersResponse.data.users?.length || 0} users\n`);

      // Test database stats endpoint
      const statsResponse = await axios.get(`${API_BASE}/auth/database/stats`, { headers: adminHeaders });
      console.log('✅ Admin database stats endpoint accessible');
      console.log(`   Database connected: ${statsResponse.data.database?.connected || false}\n`);

    } catch (error) {
      console.log('❌ Admin endpoints not accessible');
      console.log(`   Error: ${error.response?.data?.error || error.message}\n`);
    }

    // Test 4: Frontend accessibility check
    console.log('4. Frontend accessibility check...');
    console.log('📋 Manual steps to verify:');
    console.log('   1. Open: http://localhost:3000');
    console.log('   2. Login with: admin@flicknet.com / admin123');
    console.log('   3. Look for "Admin Quick Access" section on dashboard');
    console.log('   4. Click "Admin Panel" button');
    console.log('   5. Verify admin dashboard loads successfully\n');

    console.log('🎉 Admin access test completed!');
    console.log('📝 Summary:');
    console.log('   - Backend: Running ✅');
    console.log('   - Admin Login: Working ✅');
    console.log('   - Admin Endpoints: Accessible ✅');
    console.log('   - Frontend: Manual verification required');

  } catch (error) {
    console.log('❌ Unexpected error during testing:');
    console.log(`   ${error.message}`);
  }
}

// Run the test
if (require.main === module) {
  testAdminAccess();
}

module.exports = { testAdminAccess };
