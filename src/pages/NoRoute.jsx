import React from 'react';

import Navbar from '../components/Navbar';

const NoRoute = () => {
    // A placeholder for a navigation function.
    // In a real app, you would use a router here, e.g., navigate('/');
    const handleGoHome = () => {
        window.location.href = '/'; // Redirects to the home page
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-grow flex items-center justify-center text-center px-4">
                <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
                    <h1 className="text-9xl font-extrabold text-blue-600 mb-4">404</h1>
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">Page Not Found</h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Oops! The page you are looking for doesn't exist or has been moved.
                    </p>
                    <button
                        onClick={handleGoHome}
                        className="px-8 py-4 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NoRoute;
