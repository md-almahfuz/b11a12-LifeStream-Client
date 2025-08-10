import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaHeart, FaCalendarAlt, FaClock, FaEye } from 'react-icons/fa';
import axiosInstance from '../api/axiosInstance';
import Loading from '../pages/Loading';

const ShowPendingRequests = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDonationRequests = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.get('/pendingRequests');
            setRequests(response.data);
        } catch (e) {
            console.error('Failed to fetch donation requests:', e);
            setError('Failed to fetch recent donation requests. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDonationRequests();
    }, []);

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen font-sans">
                <div className="text-red-500 text-xl text-center p-4 rounded-lg bg-red-100">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Inspiring Message Section */}
                <div className="text-center mb-10 p-6 md:p-10 bg-red-600 rounded-2xl shadow-xl text-white">
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-4 animate-fade-in">
                        Be a Hero. Donate Blood.
                    </h1>
                    <p className="text-lg md:text-xl font-light mb-4 animate-fade-in-delay">
                        Your single donation can save up to three lives. Every drop counts.
                    </p>
                    <p className="text-sm italic animate-fade-in-delay-2">
                        Look through the urgent requests below and make a difference today.
                    </p>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8">
                    Urgent Donation Requests
                </h2>

                {requests.length === 0 ? (
                    <div className="text-center text-gray-600 text-xl mt-12 p-8 bg-white rounded-lg shadow-lg">
                        <p>No urgent donation requests at this time. Thank you for checking!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {requests.map(request => (
                            <div
                                key={request._id}
                                className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between border-t-4 border-red-500 transition-transform duration-300 hover:scale-105 hover:shadow-xl"
                            >
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                                        {request.recipientName}
                                    </h3>
                                    <div className="flex items-center text-gray-700">
                                        <FaMapMarkerAlt className="h-5 w-5 mr-2 text-red-500" />
                                        <span>{request.recipientDistrict}, {request.recipientUpazila}</span>
                                    </div>
                                    <div className="flex items-center text-gray-700 bg-red-100 p-2 rounded-lg">
                                        <FaHeart className="h-5 w-5 mr-2 text-red-600 animate-pulse" />
                                        <span className="font-extrabold text-xl text-red-800">{request.bloodGroup}</span>
                                    </div>
                                    <div className="flex items-center text-gray-700">
                                        <FaCalendarAlt className="h-5 w-5 mr-2 text-red-500" />
                                        <span>{request.donationDate}</span>
                                    </div>
                                    <div className="flex items-center text-gray-700">
                                        <FaClock className="h-5 w-5 mr-2 text-red-500" />
                                        <span>{request.donationTime}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => console.log(`Viewing details for request ID: ${request._id}`)}
                                    className="mt-6 w-full flex items-center justify-center bg-red-600 text-white font-bold py-3 px-4 rounded-full shadow-md hover:bg-red-700 transition-colors duration-200 transform hover:scale-105"
                                >
                                    <FaEye className="h-5 w-5 mr-2" /> View Details
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShowPendingRequests;