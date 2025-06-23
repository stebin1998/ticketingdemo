// useAuth Hook - Implements loginFlag + useEffect pattern for session control
import { useState, useEffect } from 'react';
import AuthService from '../utils/authService';

/**
 * Main authentication hook with loginFlag dependency
 * This is the core of your session control system
 */
export const useAuth = () => {
  const [loginFlag, setLoginFlag] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // Initialize authentication with loginFlag dependency
  useEffect(() => {
    console.log('🔄 useAuth: Setting up authentication listener...');
    setLoading(true);

    // Initialize AuthService with loginFlag setter
    const unsubscribe = AuthService.initializeAuth(setLoginFlag);

    // Set up listener for auth changes
    const removeListener = AuthService.addListener((authData) => {
      console.log('🔄 useAuth: Auth data updated:', authData);
      setUser(authData.user);
      setProfile(authData.profile);
      setLoading(false);
    });

    // Initial state setup
    setUser(AuthService.currentUser);
    setProfile(AuthService.userProfile);
    setLoading(false);

    return () => {
      unsubscribe();
      removeListener();
    };
  }, []); // Only run once on mount

  // This useEffect triggers whenever loginFlag changes (login/logout events)
  useEffect(() => {
    console.log('🔄 useAuth: LoginFlag changed, updating state...');
    setUser(AuthService.currentUser);
    setProfile(AuthService.userProfile);
    setLoading(false);
  }, [loginFlag]); // Dependency on loginFlag - this is your pattern!

  return {
    // Authentication state
    user,
    profile,
    loading,
    isAuthenticated: AuthService.isAuthenticated(),

    // User info
    userInfo: AuthService.getUserInfo(),
    role: AuthService.getUserRole(),

    // Authorization helpers
    hasRole: (role) => AuthService.hasRole(role),
    hasAnyRole: (roles) => AuthService.hasAnyRole(roles),
    canCreateEvents: () => AuthService.canCreateEvents(),

    // Authentication methods
    loginWithEmail: AuthService.loginWithEmail.bind(AuthService),
    signupWithEmail: AuthService.signupWithEmail.bind(AuthService),
    signupSellerWithInfo: AuthService.signupSellerWithInfo.bind(AuthService),
    loginWithGoogle: AuthService.loginWithGoogle.bind(AuthService),
    logout: AuthService.logout.bind(AuthService),
    upgradeToSeller: AuthService.upgradeToSeller.bind(AuthService),
  };
};

/**
 * Hook for seller-specific functionality
 */
export const useSeller = () => {
  const auth = useAuth();
  
  return {
    ...auth,
    isSeller: auth.hasAnyRole(['seller', 'admin']),
    canCreateEvents: auth.canCreateEvents(),
  };
};

/**
 * Hook for role-based access control
 */
export const useRoleAccess = (requiredRoles = []) => {
  const auth = useAuth();
  
  const hasAccess = Array.isArray(requiredRoles) 
    ? auth.hasAnyRole(requiredRoles)
    : auth.hasRole(requiredRoles);

  return {
    ...auth,
    hasAccess,
    accessDenied: auth.isAuthenticated && !hasAccess,
    needsLogin: !auth.isAuthenticated,
  };
};

export default useAuth; 