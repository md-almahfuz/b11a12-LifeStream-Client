import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router';
import Loading from '../pages/Loading';
import { AuthContext } from '../provider/AuthProvider';

const PrivateRoute = ({ children, requiredRole }) => {
    // Get user, loading state, and the new isRoleReady state from context
    const { user, loading, isRoleReady } = useContext(AuthContext);
    const location = useLocation();

    // 1. Show a loading state until both auth and role are ready.
    if (loading || !isRoleReady) {
        return <Loading />;
    }

    // 2. If no user is logged in, redirect to the login page.
    if (!user) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    // 3. If a required role is specified, check if the user has it.
    // The user.role property is now available because of the AuthProvider changes.
    if (requiredRole && user.role !== requiredRole) {
        console.warn(`Access denied. User role is '${user.role}', but '${requiredRole}' is required.`);
        // Redirect to the appropriate dashboard or a '403 Forbidden' page.
        // For this case, we'll redirect to the user's default dashboard.
        return <Navigate to="/dashboard" replace />;
    }

    // 4. If all checks pass, render the protected content.
    return children;
};

export default PrivateRoute;
