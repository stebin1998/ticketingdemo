import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../utils/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginFlag, setLoginFlag] = useState(false); // Login flag for useEffect dependency

  // Authentication state listener with useEffect dependency on loginFlag
  useEffect(() => {
    console.log('🔄 Setting up authentication listener, loginFlag:', loginFlag);
    setLoading(true);

    // Initialize AuthService with loginFlag setter
    const unsubscribeFirebase = AuthService.initializeAuth(setLoginFlag);

    // Set up listener for auth changes
    const removeListener = AuthService.addListener((authData) => {
      console.log('🔄 Auth state updated:', {
        user: authData.user?.email,
        profile: authData.profile?.role,
        authenticated: authData.isAuthenticated
      });

      setCurrentUser(authData.user);
      setUserProfile(authData.profile);
      setIsAuthenticated(authData.isAuthenticated);
      setLoading(false);
    });

    // Initial state setup
    setCurrentUser(AuthService.currentUser);
    setUserProfile(AuthService.userProfile);
    setIsAuthenticated(AuthService.isAuthenticated());
    setLoading(false);

    return () => {
      unsubscribeFirebase();
      removeListener();
    };
  }, [loginFlag]); // Dependency on loginFlag

  // Authentication functions
  const login = async (email, password) => {
    try {
      setLoading(true);
      const result = await AuthService.loginWithEmail(email, password);
      // AuthService will handle loginFlag trigger automatically
      console.log('✅ Login successful:', email);
      return result;
    } catch (error) {
      console.error('❌ Login error:', error);
      setLoading(false);
      throw error;
    }
  };

  const signup = async (email, password, role = 'user') => {
    try {
      setLoading(true);
      console.log('🔄 Starting signup process:', { email, role });
      
      const result = await AuthService.signupWithEmail(email, password, role);
      // AuthService will handle loginFlag trigger automatically
      console.log('✅ Signup successful:', email);
      return result;
    } catch (error) {
      console.error('❌ Signup error:', error);
      setLoading(false);
      throw error;
    }
  };

  const loginWithGoogle = async (role = 'user') => {
    try {
      setLoading(true);
      const result = await AuthService.loginWithGoogle();
      // AuthService will handle MongoDB sync automatically
      console.log('✅ Google login successful:', result.user.email);
      return result;
    } catch (error) {
      console.error('❌ Google login error:', error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      // AuthService will handle state clearing automatically
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  };

  // Authorization helper functions
  const hasRole = (role) => {
    return AuthService.hasRole(role);
  };

  const hasAnyRole = (roles) => {
    return AuthService.hasAnyRole(roles);
  };

  const isSeller = () => {
    return AuthService.hasAnyRole(['seller', 'admin']);
  };

  const isAdmin = () => {
    return AuthService.hasRole('admin');
  };

  const canCreateEvents = () => {
    return AuthService.canCreateEvents();
  };

  // Upgrade current user to seller
  const upgradeToSeller = async () => {
    try {
      const updatedUser = await AuthService.upgradeToSeller();
      // AuthService will handle state update automatically
      return updatedUser;
    } catch (error) {
      console.error('❌ Error upgrading to seller:', error);
      throw error;
    }
  };

  // Get user info
  const getUserInfo = () => {
    return AuthService.getUserInfo();
  };

  const value = {
    // State
    currentUser,
    userProfile,
    loading,
    isAuthenticated,
    loginFlag,
    
    // Authentication methods
    login,
    signup,
    loginWithGoogle,
    logout,
    
    // Authorization methods
    hasRole,
    hasAnyRole,
    isSeller,
    isAdmin,
    canCreateEvents,
    upgradeToSeller,
    getUserInfo,
    
    // Utility
    setLoginFlag
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 