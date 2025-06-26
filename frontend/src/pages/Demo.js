import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Demo = () => {
  const navigate = useNavigate();
  const { 
    loading, 
    isAuthenticated, 
    userInfo, 
    role, 
    hasRole, 
    hasAnyRole, 
    canCreateEvents,
    loginWithEmail, 
    signupWithEmail, 
    loginWithGoogle, 
    logout, 
    upgradeToSeller 
  } = useAuth();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', role: 'user' });
  const [showLogin, setShowLogin] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setError('');
    
    try {
      await loginWithEmail(loginForm.email, loginForm.password);
      console.log('✅ Login successful');
    } catch (error) {
      setError('Login failed: ' + error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setError('');
    
    try {
      await signupWithEmail(signupForm.email, signupForm.password, signupForm.role);
      console.log('✅ Signup successful');
    } catch (error) {
      setError('Signup failed: ' + error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setError('');
    
    try {
      await loginWithGoogle();
      console.log('✅ Google login successful');
    } catch (error) {
      setError('Google login failed: ' + error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      setError("Error logging out: " + err.message);
    }
  };

  const handleUpgradeToSeller = async () => {
    setAuthLoading(true);
    setError('');
    
    try {
      await upgradeToSeller();
      console.log('✅ Upgraded to seller successfully');
    } catch (error) {
      setError('Upgrade failed: ' + error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Authenticated User View
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white shadow-2xl rounded-3xl p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  🎉 Authentication Demo Success!
                </h1>
                <p className="text-lg text-gray-600">
                  Welcome to your authenticated session with role-based access control
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="bg-white shadow-xl rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">👤 User Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p><strong>Email:</strong> {userInfo?.email}</p>
                <p><strong>Display Name:</strong> {userInfo?.displayName || 'Not set'}</p>
                <p><strong>Firebase UID:</strong> {userInfo?.uid?.substring(0, 10)}...</p>
              </div>
              <div className="space-y-2">
                <p><strong>Role:</strong> 
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                    role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    role === 'seller' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {role}
                  </span>
                </p>
                <p><strong>Status:</strong> 
                  <span className="ml-2 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {userInfo?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Role-Based Access Control Demo */}
          <div className="bg-white shadow-xl rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">🔐 Role-Based Access Control</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* User Role Features */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-green-600 mb-2">✅ User Features</h3>
                <ul className="space-y-1 text-sm">
                  <li>• View events</li>
                  <li>• Purchase tickets</li>
                  <li>• View profile</li>
                  <li>• Basic access</li>
                </ul>
              </div>

              {/* Seller Role Features */}
              <div className={`p-4 border rounded-lg ${canCreateEvents() ? 'bg-green-50' : 'bg-gray-50 opacity-50'}`}>
                <h3 className={`font-semibold mb-2 ${canCreateEvents() ? 'text-green-600' : 'text-gray-400'}`}>
                  {canCreateEvents() ? '✅' : '❌'} Seller Features
                </h3>
                <ul className="space-y-1 text-sm">
                  <li>• Create events</li>
                  <li>• Manage events</li>
                  <li>• View analytics</li>
                  <li>• Seller dashboard</li>
                </ul>
              </div>

              {/* Admin Role Features */}
              <div className={`p-4 border rounded-lg ${hasRole('admin') ? 'bg-purple-50' : 'bg-gray-50 opacity-50'}`}>
                <h3 className={`font-semibold mb-2 ${hasRole('admin') ? 'text-purple-600' : 'text-gray-400'}`}>
                  {hasRole('admin') ? '✅' : '❌'} Admin Features
                </h3>
                <ul className="space-y-1 text-sm">
                  <li>• Manage all users</li>
                  <li>• System settings</li>
                  <li>• Full access</li>
                  <li>• Override permissions</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white shadow-xl rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">🚀 Available Actions</h2>
            <div className="flex flex-wrap gap-4">
              
              {/* Create Event Button */}
              <button
                onClick={() => navigate('/create-event')}
                disabled={!canCreateEvents()}
                className={`px-6 py-3 rounded-full font-medium transition ${
                  canCreateEvents()
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {canCreateEvents() ? '✨ Create Event' : '🔒 Create Event (Seller Only)'}
              </button>

              {/* Dashboard Button */}
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition font-medium"
              >
                📊 Go to Dashboard
              </button>

              {/* Upgrade to Seller Button */}
              {!hasAnyRole(['seller', 'admin']) && (
                <button
                  onClick={handleUpgradeToSeller}
                  disabled={authLoading}
                  className="bg-yellow-500 text-white px-6 py-3 rounded-full hover:bg-yellow-600 transition font-medium disabled:opacity-50"
                >
                  {authLoading ? '⏳ Upgrading...' : '⬆️ Upgrade to Seller'}
                </button>
              )}

              {/* Profile Button */}
              <button
                onClick={() => navigate('/profile')}
                className="bg-purple-500 text-white px-6 py-3 rounded-full hover:bg-purple-600 transition font-medium"
              >
                👤 View Profile
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>
      </div>    
    );
  }

  // Login/Signup Form View
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="bg-white shadow-2xl rounded-3xl p-8 max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          🔐 Authentication Demo
        </h1>

        {/* Toggle between Login/Signup */}
        <div className="flex mb-6">
          <button
            onClick={() => setShowLogin(true)}
            className={`flex-1 py-2 px-4 text-center rounded-l-lg ${
              showLogin ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setShowLogin(false)}
            className={`flex-1 py-2 px-4 text-center rounded-r-lg ${
              !showLogin ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Signup
          </button>
        </div>

        {/* Login Form */}
        {showLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
            >
              {authLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          /* Signup Form */
          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={signupForm.email}
              onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={signupForm.password}
              onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              value={signupForm.role}
              onChange={(e) => setSignupForm({...signupForm, role: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="seller">Seller</option>
            </select>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
            >
              {authLoading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
        )}

        {/* Google Login */}
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>
          <button
            onClick={handleGoogleLogin}
            disabled={authLoading}
            className="w-full mt-4 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
          >
            {authLoading ? 'Signing in...' : '🔍 Sign in with Google'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Demo Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>This demo showcases:</p>
          <ul className="mt-2 space-y-1 text-left">
            <li>• Firebase Authentication</li>
            <li>• MongoDB User Profiles</li>
            <li>• Role-based Access Control</li>
            <li>• Session Management</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Demo;
