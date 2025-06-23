import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * PrivateRoute - Requires user to be logged in
 * Redirects to login if not authenticated
 */
export const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Show loading while checking auth state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated, preserving intended destination
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

/**
 * SellerRoute - Requires user to be logged in AND have seller/admin role
 * Redirects to seller signup if user but not seller
 * Redirects to login if not authenticated
 */
export const SellerRoute = ({ children }) => {
    const { isAuthenticated, loading, canCreateEvents, userInfo } = useAuth();
    const location = useLocation();

    // Show loading while checking auth state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying seller permissions...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Redirect to seller signup if logged in but not a seller
    if (!canCreateEvents()) {
        const email = userInfo?.email || '';
        return <Navigate to={`/seller-signup?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(location.pathname)}`} replace />;
    }

    return children;
};

/**
 * AdminRoute - Requires admin role
 * Redirects appropriately based on user state
 */
export const AdminRoute = ({ children }) => {
    const { isAuthenticated, loading, hasRole } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying admin permissions...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!hasRole('admin')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-red-300">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                    <div className="text-red-500 text-6xl mb-4">🚫</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
                    <p className="text-gray-600 mb-6">This area requires administrator privileges.</p>
                    <button 
                        onClick={() => window.history.back()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

/**
 * GuestRoute - Only for non-authenticated users (login, signup pages)
 * Redirects authenticated users to dashboard
 */
export const GuestRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect authenticated users to dashboard
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}; 