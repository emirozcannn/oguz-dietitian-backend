import React, { useState } from 'react';
import * as AuthContext from '../context/AuthContext';
import apiClient from '../lib/api';

const AuthTestPage = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, userRole, signIn, signUp } = AuthContext.useAuth();

  const runAuthTests = async () => {
    setLoading(true);
    setTestResults([]);
    const results = [];

    // Test 1: API Health Check
    try {
      const response = await apiClient.getHealth();
      
      results.push({
        test: 'API Health Check',
        status: response.success ? 'SUCCESS' : 'FAILED',
        message: response.success ? 'API is healthy' : 'API health check failed',
        details: response
      });
    } catch (err) {
      results.push({
        test: 'API Health Check',
        status: 'FAILED',
        message: err.message,
        details: err
      });
    }

    // Test 2: Current user check
    if (user) {
      try {
        const response = await apiClient.getMe();
        
        results.push({
          test: 'Current User Check',
          status: response.success ? 'SUCCESS' : 'FAILED',
          message: response.success ? `Logged in as: ${response.data.user.email}` : 'Failed to get user data',
          details: response
        });
      } catch (err) {
        results.push({
          test: 'Current User Check',
          status: 'FAILED',
          message: err.message,
          details: err
        });
      }
    } else {
      results.push({
        test: 'Current User Check',
        status: 'INFO',
        message: 'Not logged in',
        details: null
      });
    }

    // Test 3: Database Content Tests
    try {
      const [categoriesRes, packagesRes, postsRes] = await Promise.all([
        apiClient.getCategories(),
        apiClient.getPackages(),
        apiClient.getAllPosts()
      ]);

      results.push({
        test: 'Categories Check',
        status: categoriesRes.success ? 'SUCCESS' : 'FAILED',
        message: categoriesRes.success ? `Found ${categoriesRes.data.categories.length} categories` : 'Failed to fetch categories',
        details: categoriesRes
      });

      results.push({
        test: 'Packages Check',
        status: packagesRes.success ? 'SUCCESS' : 'FAILED',
        message: packagesRes.success ? `Found ${packagesRes.data.packages.length} packages` : 'Failed to fetch packages',
        details: packagesRes
      });

      results.push({
        test: 'Blog Posts Check',
        status: postsRes.success ? 'SUCCESS' : 'FAILED',
        message: postsRes.success ? `Found ${postsRes.data.posts.length} posts` : 'Failed to fetch posts',
        details: postsRes
      });
    } catch (err) {
      results.push({
        test: 'Database Content Tests',
        status: 'FAILED',
        message: err.message,
        details: err
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  const createTestUser = async () => {
    try {
      console.log('Creating test user...');
      
      const result = await signUp({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        password: 'password123'
      });

      if (result.error) {
        alert(`Hata: ${result.error.message}`);
      } else {
        alert('Test kullanıcısı başarıyla oluşturuldu!');
      }
    } catch (err) {
      console.error('Test kullanıcısı oluşturma exception:', err);
      alert(`Exception: ${err.message}`);
    }
  };

  const testLogin = async () => {
    try {
      console.log('Testing login...');
      
      const result = await signIn('admin@oguzyolyapan.com', 'admin123456');

      if (result.error) {
        alert(`Login Hatası: ${result.error.message}`);
      } else {
        alert('Admin girişi başarılı!');
      }
    } catch (err) {
      console.error('Login test exception:', err);
      alert(`Exception: ${err.message}`);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <h2>API & Authentication Test Page</h2>
          
          {/* Current Auth Status */}
          <div className="card mb-4">
            <div className="card-header">
              <h5>Current Authentication Status</h5>
            </div>
            <div className="card-body">
              <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
              <p><strong>Role:</strong> {userRole || 'None'}</p>
              <p><strong>User ID:</strong> {user ? user._id : 'None'}</p>
            </div>
          </div>

          {/* Test Demo Users */}
          <div className="card mb-4">
            <div className="card-header">
              <h5>Test Functions</h5>
            </div>
            <div className="card-body">
              <div className="alert alert-info">
                <h6>Demo Kullanıcıları:</h6>
                <p><strong>Admin:</strong> admin@oguzyolyapan.com / admin123456</p>
                <p><strong>Test User:</strong> test@test.com / password123</p>
                <p className="mb-0"><small>Admin kullanıcısı backend seed ile oluşturulmuştur.</small></p>
              </div>

              <button 
                onClick={runAuthTests}
                disabled={loading}
                className="btn btn-primary me-2 mb-2"
              >
                {loading ? 'Testing...' : 'Run API Tests'}
              </button>

              <button 
                onClick={testLogin}
                className="btn btn-success me-2 mb-2"
              >
                Test Admin Login
              </button>

              <button 
                onClick={createTestUser}
                className="btn btn-info me-2 mb-2"
              >
                Create Test User
              </button>
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h5>Test Results</h5>
              </div>
              <div className="card-body">
                {testResults.map((result, index) => (
                  <div key={index} className={`alert ${
                    result.status === 'SUCCESS' ? 'alert-success' : 
                    result.status === 'INFO' ? 'alert-info' : 'alert-danger'
                  }`}>
                    <h6>{result.test}</h6>
                    <p>{result.message}</p>
                    <details>
                      <summary>Details</summary>
                      <pre style={{ fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthTestPage;
