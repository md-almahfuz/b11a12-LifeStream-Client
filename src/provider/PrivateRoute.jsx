import React, { use } from 'react';
import { Navigate, useLocation } from 'react-router';
import { AuthContext } from './AuthProvider';
import Loading from '../pages/Loading';

const PrivateRoute = ({ children }) => {

    // Using the use hook to access the AuthContext
    // This will give us the user and loading state from the AuthContext
    const { user, loading } = use(AuthContext);
    //console.log(user);


    const location = useLocation();
    //console.log(location);

    // If the user is not authenticated, redirect them to the login page
    // and save the current location so they can be redirected back after logging in
    // If the user is authenticated, render the children components
    // If the loading state is true, show a loading spinner
    // If the user is authenticated, render the children components
    if (loading) {
        return <Loading></Loading>;
    }
    if (user && user?.email) {
        return children;
    }
    return <Navigate state={location.pathname} to="/auth/login"></Navigate>;
    // Check if the user is authenticated
};

export default PrivateRoute;