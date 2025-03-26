const axios = require('axios');

const API_URL = 'http://localhost:5001/api/v1';
let authToken = '';

const tests = {
  async testPasswordValidation() {
    try {
      await axios.post(`${API_URL}/auth/register`, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'weak'
      });
      console.log('❌ Password validation test failed - accepted weak password');
    } catch (error) {
      if (error.response?.data?.error?.includes('Password must be')) {
        console.log('✅ Password validation test passed');
      } else {
        console.log('❌ Password validation test failed with unexpected error:', error.response?.data?.error);
      }
    }
  },

  async testValidRegistration() {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123!'
      });
      console.log('✅ Registration test passed');
      return response.data.token;
    } catch (error) {
      console.log('❌ Registration test failed:', error.response?.data?.error);
      return null;
    }
  },

  async testDuplicateEmail() {
    try {
      await axios.post(`${API_URL}/auth/register`, {
        name: 'Test User 2',
        email: 'test@example.com',
        password: 'TestPass123!'
      });
      console.log('❌ Duplicate email test failed - accepted duplicate email');
    } catch (error) {
      if (error.response?.data?.error === 'Email already registered') {
        console.log('✅ Duplicate email test passed');
      } else {
        console.log('❌ Duplicate email test failed with unexpected error:', error.response?.data?.error);
      }
    }
  },

  async testLogin() {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'TestPass123!'
      });
      authToken = response.data.token;
      console.log('✅ Login test passed');
    } catch (error) {
      console.log('❌ Login test failed:', error.response?.data?.error);
    }
  },

  async testProtectedRoute() {
    try {
      await axios.get(`${API_URL}/auth/updatedetails`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Protected route test passed');
    } catch (error) {
      console.log('❌ Protected route test failed:', error.response?.data?.error);
    }
  },

  async testInvalidToken() {
    try {
      await axios.get(`${API_URL}/auth/updatedetails`, {
        headers: { Authorization: 'Bearer invalid_token' }
      });
      console.log('❌ Invalid token test failed - accepted invalid token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid token test passed');
      } else {
        console.log('❌ Invalid token test failed with unexpected error:', error.response?.data?.error);
      }
    }
  },

  async testPasswordUpdate() {
    try {
      await axios.put(
        `${API_URL}/auth/updatepassword`,
        {
          currentPassword: 'TestPass123!',
          newPassword: 'NewTestPass123!'
        },
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      console.log('✅ Password update test passed');
    } catch (error) {
      console.log('❌ Password update test failed:', error.response?.data?.error);
    }
  },

  async testLogout() {
    try {
      await axios.get(`${API_URL}/auth/logout`);
      console.log('✅ Logout test passed');
    } catch (error) {
      console.log('❌ Logout test failed:', error.response?.data?.error);
    }
  }
};

async function runTests() {
  console.log('Starting authentication tests...\n');
  
  await tests.testPasswordValidation();
  await tests.testValidRegistration();
  await tests.testDuplicateEmail();
  await tests.testLogin();
  await tests.testProtectedRoute();
  await tests.testInvalidToken();
  await tests.testPasswordUpdate();
  await tests.testLogout();
  
  console.log('\nTests completed.');
}

runTests().catch(console.error); 